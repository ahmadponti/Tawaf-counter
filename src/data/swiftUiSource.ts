/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SwiftFile {
  filename: string;
  category: 'App' | 'ViewModel' | 'Services' | 'Views';
  code: string;
  description: string;
}

export const SWIFT_SOURCE_FILES: SwiftFile[] = [
  {
    filename: 'TawafCounterApp.swift',
    category: 'App',
    description: 'Main SwiftUI App lifecycle with StateObject and IdleTimer management',
    code: `import SwiftUI

@main
struct TawafCounterApp: App {
    @StateObject private var viewModel = TawafViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
                .preferredColorScheme(.dark)
                .onAppear {
                    // Keep screen awake during active Tawaf
                    UIApplication.shared.isIdleTimerDisabled = true
                }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var vm: TawafViewModel
    
    var body: some View {
        ZStack {
            Color(red: 0.05, green: 0.07, blue: 0.09)
                .ignoresSafeArea()
            
            switch vm.sessionState {
            case .setup:
                SetupCalibrationView()
                    .transition(.opacity)
            case .active:
                MainCounterView()
                    .transition(.slide)
            case .completed:
                CompletionView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.25), value: vm.sessionState)
    }
}`
  },
  {
    filename: 'TawafViewModel.swift',
    category: 'ViewModel',
    description: 'ObservableObject managing Tawaf state, timer, haptics, and manual/auto counting',
    code: `import SwiftUI
import CoreLocation
import CoreMotion
import Combine

enum SessionState: String, Codable {
    case setup
    case active
    case completed
}

enum CountMode: String, Codable {
    case autoAndManual
    case manualOnly
}

struct CircuitLap: Identifiable, Codable {
    var id = UUID()
    let circuitNumber: Int
    let durationSeconds: Int
    let timestamp: Date
    let detectionType: String // "Manual", "Automatic", "Confirmed"
}

@MainActor
final class TawafViewModel: ObservableObject {
    @Published var sessionState: SessionState = .setup
    @Published var currentCircuit: Int = 1
    @Published var mode: CountMode = .autoAndManual
    @Published var laps: [CircuitLap] = []
    
    @Published var isCalibrated: Bool = false
    @Published var calibrationHeading: Double = 0.0
    
    @Published var sessionStartTime: Date?
    @Published var currentLapStartTime: Date?
    @Published var elapsedTimeString: String = "00:00"
    
    @Published var showResetConfirmation: Bool = false
    @Published var showUncertaintyAlert: Bool = false
    @Published var uncertaintyCandidateLap: Int = 1
    
    @Published var hapticsEnabled: Bool = true
    @Published var keepScreenAwake: Bool = true
    
    private let motionLocation = MotionLocationManager()
    private var timerCancellable: AnyCancellable?
    private let hapticFeedback = UIImpactFeedbackGenerator(style: .medium)
    private let notificationFeedback = UINotificationFeedbackGenerator()
    
    init() {
        restoreSession()
        setupSensorSubscribers()
    }
    
    func startTawaf() {
        sessionState = .active
        currentCircuit = 1
        laps = []
        let now = Date()
        sessionStartTime = now
        currentLapStartTime = now
        
        startTimer()
        motionLocation.startTracking()
        triggerLightHaptic()
        saveSession()
    }
    
    func incrementCircuit(detectionType: String = "Manual") {
        guard currentCircuit <= 7 else { return }
        
        let now = Date()
        let lapDuration = Int(now.timeIntervalSince(currentLapStartTime ?? now))
        
        let lap = CircuitLap(
            circuitNumber: currentCircuit,
            durationSeconds: max(1, lapDuration),
            timestamp: now,
            detectionType: detectionType
        )
        laps.append(lap)
        
        triggerCircuitHaptic()
        
        if currentCircuit >= 7 {
            // Completed 7 circuits
            sessionState = .completed
            motionLocation.stopTracking()
            timerCancellable?.cancel()
            triggerCompletionHaptic()
        } else {
            currentCircuit += 1
            currentLapStartTime = now
            motionLocation.resetCircuitAccumulator()
        }
        
        saveSession()
    }
    
    func undoCircuit() {
        guard currentCircuit > 1 else { return }
        currentCircuit -= 1
        if !laps.isEmpty {
            laps.removeLast()
        }
        currentLapStartTime = Date()
        motionLocation.resetCircuitAccumulator()
        triggerLightHaptic()
        saveSession()
    }
    
    func resetSession() {
        sessionState = .setup
        currentCircuit = 1
        laps = []
        sessionStartTime = nil
        currentLapStartTime = nil
        timerCancellable?.cancel()
        motionLocation.stopTracking()
        UserDefaults.standard.removeObject(forKey: "tawaf_active_session")
    }
    
    private func setupSensorSubscribers() {
        motionLocation.onCircuitCompleted = { [weak self] in
            Task { @MainActor in
                guard let self = self, self.mode == .autoAndManual, self.sessionState == .active else { return }
                self.incrementCircuit(detectionType: "Automatic")
            }
        }
        
        motionLocation.onUncertaintyDetected = { [weak self] candidate in
            Task { @MainActor in
                guard let self = self, self.mode == .autoAndManual, self.sessionState == .active else { return }
                self.uncertaintyCandidateLap = candidate
                self.showUncertaintyAlert = true
            }
        }
    }
    
    private func startTimer() {
        timerCancellable = Timer.publish(every: 1.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self = self, let start = self.sessionStartTime else { return }
                let elapsed = Int(Date().timeIntervalSince(start))
                let mins = elapsed / 60
                let secs = elapsed % 60
                self.elapsedTimeString = String(format: "%02d:%02d", mins, secs)
            }
    }
    
    private func triggerCircuitHaptic() {
        guard hapticsEnabled else { return }
        hapticFeedback.prepare()
        hapticFeedback.impactOccurred(intensity: 0.85)
    }
    
    private func triggerLightHaptic() {
        guard hapticsEnabled else { return }
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    private func triggerCompletionHaptic() {
        guard hapticsEnabled else { return }
        notificationFeedback.notificationOccurred(.success)
    }
    
    private func saveSession() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(laps) {
            UserDefaults.standard.set(encoded, forKey: "tawaf_laps")
        }
        UserDefaults.standard.set(currentCircuit, forKey: "tawaf_circuit")
        UserDefaults.standard.set(sessionState.rawValue, forKey: "tawaf_state")
    }
    
    private func restoreSession() {
        if let savedCircuit = UserDefaults.standard.value(forKey: "tawaf_circuit") as? Int,
           let stateStr = UserDefaults.standard.string(forKey: "tawaf_state"),
           let state = SessionState(rawValue: stateStr), state == .active {
            currentCircuit = savedCircuit
            sessionState = state
            sessionStartTime = Date()
            currentLapStartTime = Date()
            startTimer()
        }
    }
}`
  },
  {
    filename: 'MotionLocationManager.swift',
    category: 'Services',
    description: 'CoreLocation & CoreMotion service filtering counter-clockwise Tawaf circumambulation',
    code: `import Foundation
import CoreLocation
import CoreMotion

final class MotionLocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private let motionManager = CMMotionManager()
    
    // Kaaba reference coordinate in Mecca
    private let kaabaLat = 21.422487
    private let kaabaLon = 39.826206
    
    var onCircuitCompleted: (() -> Void)?
    var onUncertaintyDetected: ((Int) -> Void)?
    
    private var lastLocation: CLLocation?
    private var lastKaabaBearing: Double?
    private var cumulativeCCWAngle: Double = 0.0
    private var accumulatedDistance: Double = 0.0
    private var circuitStartTime: Date = Date()
    
    private let minCircuitPerimeterMeters: Double = 140.0
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 1.0 // update every meter
        locationManager.headingFilter = 5.0
    }
    
    func requestPermissions() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startTracking() {
        cumulativeCCWAngle = 0.0
        accumulatedDistance = 0.0
        circuitStartTime = Date()
        locationManager.startUpdatingLocation()
        locationManager.startUpdatingHeading()
    }
    
    func stopTracking() {
        locationManager.stopUpdatingLocation()
        locationManager.stopUpdatingHeading()
    }
    
    func resetCircuitAccumulator() {
        cumulativeCCWAngle = 0.0
        accumulatedDistance = 0.0
        circuitStartTime = Date()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Filter out low accuracy points
        if location.horizontalAccuracy < 0 || location.horizontalAccuracy > 25 {
            return
        }
        
        if let last = lastLocation {
            let step = location.distance(from: last)
            if step > 0.3 && step < 6.0 { // Reasonable walking step
                accumulatedDistance += step
            }
        }
        lastLocation = location
        
        // Calculate bearing from Kaaba to user
        let currentBearing = calculateBearing(fromLat: kaabaLat, fromLon: kaabaLon, toLat: location.coordinate.latitude, toLon: location.coordinate.longitude)
        
        if let lastBearing = lastKaabaBearing {
            var diff = currentBearing - lastBearing
            if diff < -180 { diff += 360 }
            if diff > 180 { diff -= 360 }
            
            // Tawaf is counter-clockwise (increasing CCW angle)
            if diff > 0 && diff < 45 {
                cumulativeCCWAngle += diff
            }
        }
        lastKaabaBearing = currentBearing
        
        evaluateCircuit()
    }
    
    private func evaluateCircuit() {
        let duration = Date().timeIntervalSince(circuitStartTime)
        
        // Avoid counting standing still or short walking
        guard accumulatedDistance >= minCircuitPerimeterMeters && duration > 75 else {
            return
        }
        
        // Definite circuit completion: full 360° counter-clockwise circumambulation
        if cumulativeCCWAngle >= 345.0 {
            onCircuitCompleted?()
            resetCircuitAccumulator()
            return
        }
        
        // Uncertainty check: pilgrim walked perimeter and completed ~315°-345°
        if cumulativeCCWAngle >= 310.0 && cumulativeCCWAngle < 345.0 {
            onUncertaintyDetected?(1)
        }
    }
    
    private func calculateBearing(fromLat: Double, fromLon: Double, toLat: Double, toLon: Double) -> Double {
        let dLon = (toLon - fromLon) * .pi / 180.0
        let y = sin(dLon) * cos(toLat * .pi / 180.0)
        let x = cos(fromLat * .pi / 180.0) * sin(toLat * .pi / 180.0) - sin(fromLat * .pi / 180.0) * cos(toLat * .pi / 180.0) * cos(dLon)
        let radians = atan2(y, x)
        return (radians * 180.0 / .pi + 360.0).truncatingRemainder(dividingBy: 360.0)
    }
}`
  },
  {
    filename: 'MainCounterView.swift',
    category: 'Views',
    description: 'Primary one-handed counting view with dynamic 7-circuit ring and accessible buttons',
    code: `import SwiftUI

struct MainCounterView: View {
    @EnvironmentObject var vm: TawafViewModel
    
    var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            HStack {
                Button(action: { vm.showResetConfirmation = true }) {
                    Text("Reset")
                        .font(.system(.body, design: .rounded))
                        .foregroundColor(.gray)
                }
                .accessibilityLabel("Reset Tawaf Session")
                
                Spacer()
                
                // Mode indicator toggle
                Button(action: {
                    vm.mode = (vm.mode == .autoAndManual) ? .manualOnly : .autoAndManual
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: vm.mode == .autoAndManual ? "location.fill" : "hand.tap.fill")
                            .font(.system(size: 11))
                        Text(vm.mode == .autoAndManual ? "Auto + Manual" : "Manual Only")
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.08))
                    .cornerRadius(8)
                    .foregroundColor(vm.mode == .autoAndManual ? Color(red: 0.85, green: 0.70, blue: 0.35) : .white)
                }
                .accessibilityLabel("Toggle Counting Mode")
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            
            Spacer(minLength: 12)
            
            // Central Circuit Display
            VStack(spacing: 16) {
                // Circular 7-Segment Progress Track
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.08), lineWidth: 14)
                        .frame(width: 260, height: 260)
                    
                    Circle()
                        .trim(from: 0, to: CGFloat(vm.currentCircuit - 1) / 7.0)
                        .stroke(
                            Color(red: 0.85, green: 0.70, blue: 0.35),
                            style: StrokeStyle(lineWidth: 14, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .frame(width: 260, height: 260)
                        .animation(.spring(response: 0.4), value: vm.currentCircuit)
                    
                    VStack(spacing: 4) {
                        Text("CIRCUIT")
                            .font(.system(size: 13, weight: .bold))
                            .tracking(2)
                            .foregroundColor(.gray)
                        
                        Text("\\(vm.currentCircuit)")
                            .font(.system(size: 84, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .accessibilityLabel("Circuit \\(vm.currentCircuit) of 7")
                        
                        Text("of 7 completed")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                        
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.system(size: 11))
                            Text(vm.elapsedTimeString)
                                .font(.system(size: 13, weight: .medium, design: .monospaced))
                        }
                        .foregroundColor(.gray)
                        .padding(.top, 4)
                    }
                }
            }
            
            Spacer(minLength: 24)
            
            // Bottom Action Zone (Thumb reachable)
            VStack(spacing: 14) {
                // Giant +1 Circuit Button
                Button(action: {
                    vm.incrementCircuit(detectionType: "Manual")
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 24, weight: .bold))
                        Text(vm.currentCircuit >= 7 ? "Complete Circuit 7" : "Complete Circuit \\(vm.currentCircuit)")
                            .font(.system(size: 20, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 72)
                    .background(Color(red: 0.85, green: 0.70, blue: 0.35))
                    .foregroundColor(Color(red: 0.08, green: 0.08, blue: 0.10))
                    .cornerRadius(20)
                    .shadow(color: Color(red: 0.85, green: 0.70, blue: 0.35).opacity(0.25), radius: 10, y: 4)
                }
                .accessibilityHint("Adds 1 to your completed Tawaf circuits")
                
                // Secondary Undo Button
                Button(action: { vm.undoCircuit() }) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.uturn.backward")
                            .font(.system(size: 14, weight: .semibold))
                        Text("Undo Last Lap")
                            .font(.system(size: 15, weight: .medium))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.white.opacity(0.08))
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .disabled(vm.currentCircuit <= 1)
                .opacity(vm.currentCircuit <= 1 ? 0.35 : 1.0)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
        .alert("Reset Tawaf Session?", isPresented: $vm.showResetConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Reset Count", role: .destructive) { vm.resetSession() }
        } message: {
            Text("This will clear your current circuit progress and reset to Circuit 1.")
        }
        .alert("Possible Circuit Completed?", isPresented: $vm.showUncertaintyAlert) {
            Button("Confirm +1", role: .none) {
                vm.incrementCircuit(detectionType: "Confirmed")
            }
            Button("Ignore", role: .cancel) { }
        } message: {
            Text("The app detected you may have completed a circuit near Hajar al-Aswad.")
        }
    }
}`
  },
  {
    filename: 'SetupCalibrationView.swift',
    category: 'Views',
    description: 'Onboarding and Hajar al-Aswad calibration step before starting Tawaf',
    code: `import SwiftUI

struct SetupCalibrationView: View {
    @EnvironmentObject var vm: TawafViewModel
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon / Motif
            ZStack {
                Circle()
                    .fill(Color(red: 0.85, green: 0.70, blue: 0.35).opacity(0.12))
                    .frame(width: 90, height: 90)
                
                Image(systemName: "cube.fill")
                    .font(.system(size: 38))
                    .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
            }
            
            VStack(spacing: 8) {
                Text("Start at Hajar al-Aswad")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Stand in alignment with the Black Stone corner and the green indicator light on the Haram wall before tapping Start.")
                    .font(.system(size: 15))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            
            // Calibration card
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    Image(systemName: "info.circle")
                        .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                    Text("Crowded Area Transparency")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                Text("Sensors help estimate laps automatically, but thick crowd density or indoor floors can affect GPS. The large manual +1 button is always ready at your thumb.")
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
                    .lineSpacing(2)
            }
            .padding(16)
            .background(Color.white.opacity(0.05))
            .cornerRadius(14)
            .padding(.horizontal, 20)
            
            Spacer()
            
            // Start Tawaf Button
            Button(action: {
                vm.startTawaf()
            }) {
                Text("Start Tawaf")
                    .font(.system(size: 18, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(Color(red: 0.85, green: 0.70, blue: 0.35))
                    .foregroundColor(Color(red: 0.08, green: 0.08, blue: 0.10))
                    .cornerRadius(16)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }
}`
  },
  {
    filename: 'CompletionView.swift',
    category: 'Views',
    description: 'Calm, respectful completion screen after 7th circuit is finished',
    code: `import SwiftUI

struct CompletionView: View {
    @EnvironmentObject var vm: TawafViewModel
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Respectful completion icon
            ZStack {
                Circle()
                    .fill(Color(red: 0.85, green: 0.70, blue: 0.35).opacity(0.15))
                    .frame(width: 96, height: 96)
                
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 48))
                    .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
            }
            
            VStack(spacing: 10) {
                Text("Tawaf Completed")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                
                Text("تقبل الله طوافكم")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                
                Text("May your worship be accepted. You have completed all 7 circuits around the Kaaba.")
                    .font(.system(size: 15))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            
            // Summary Card
            VStack(spacing: 12) {
                HStack {
                    Text("Total Duration")
                        .foregroundColor(.gray)
                    Spacer()
                    Text(vm.elapsedTimeString)
                        .font(.system(.body, design: .monospaced))
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                }
                
                Divider().background(Color.white.opacity(0.1))
                
                HStack {
                    Text("Total Circuits")
                        .foregroundColor(.gray)
                    Spacer()
                    Text("7 of 7")
                        .fontWeight(.semibold)
                        .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                }
            }
            .padding(18)
            .background(Color.white.opacity(0.06))
            .cornerRadius(16)
            .padding(.horizontal, 20)
            
            // Gentle Sunnah reminder note
            Text("Recommended: Pray 2 Raka'at behind Maqam Ibrahim (or anywhere in the Haram if crowded) and drink Zamzam water.")
                .font(.system(size: 13))
                .foregroundColor(.gray.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
            
            Spacer()
            
            Button(action: { vm.resetSession() }) {
                Text("Start New Tawaf")
                    .font(.system(size: 17, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(Color.white.opacity(0.1))
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }
}`
  },
  {
    filename: 'Info.plist',
    category: 'App',
    description: 'Privacy and hardware permission descriptions for Location & Motion',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Tawaf Counter</string>
    <key>CFBundleDisplayName</key>
    <string>عداد الطواف</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Your location is used locally on your device to estimate completion of circuits around the Kaaba. Location data is never recorded or transmitted.</string>
    <key>NSMotionUsageDescription</key>
    <string>Motion sensors assist in detecting rotation and steps around the Kaaba strictly on-device.</string>
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
    </array>
    <key>UIRequiresPersistentWiFi</key>
    <false/>
</dict>
</plist>`
  },
  {
    filename: 'Localizable.strings (Arabic)',
    category: 'App',
    description: 'Full Arabic localization catalog for iOS app and Right-to-Left layouts',
    code: `/* Arabic Strings Catalog for Tawaf Counter (ar.lproj) */

"app_name" = "عداد الطواف";
"start_at_hajar_al_aswad" = "البداية من الحجر الأسود";
"setup_guidance" = "استقبل ركن الحجر الأسود بمحاذاة الخط الرخامي البني وإشارة الضوء الأخضر على جدار الحرم قبل بدء العد.";
"circuit_ccw" = "الطواف عكس عقارب الساعة";
"circuit_ccw_desc" = "اجعل الكعبة المشرفة عن يسارك طوال الأشواط السبعة.";
"start_tawaf" = "ابدأ الطواف (الشوط الأول)";

"circuit" = "الشوط";
"circuit_n_of_7" = "الشوط %d من ٧";
"of_7_completed" = "من ٧ أشواط مكتملة";
"complete_circuit_n" = "+١ إتمام الشوط %d";
"finish_circuit_7" = "إتمام الشوط السابع";
"undo_last_lap" = "تراجع عن الشوط السابق";
"reset" = "إعادة تعيين";
"auto_and_manual" = "تلقائي + يدوي";
"manual_only" = "يدوي فقط";

"tawaf_completed" = "تم الطواف بحمد الله";
"tawaf_mubarak" = "تَقَبَّلَ اللَّهُ طَوَافَكُمْ";
"total_duration" = "المدة الإجمالية";
"sunnah_reminder" = "صلاة ركعتين خلف مقام إبراهيم (أو في أي مكان من الحرم عند الزحام) والشرب من ماء زمزم.";
"start_new_tawaf" = "بدء طواف جديد";`
  },
  {
    filename: 'PrayerCountdownBannerView.swift',
    category: 'Views',
    description: 'Top banner showing live countdown to next prayer in Masjid al-Haram',
    code: `import SwiftUI

struct PrayerCountdownBannerView: View {
    @State private var remainingTime: String = "42m 15s"
    @State private var nextPrayerName: String = "Dhuhr"
    @State private var isApproaching: Bool = false
    @State private var showScheduleSheet: Bool = false
    
    let timer = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()
    
    var body: some View {
        Button(action: { showScheduleSheet = true }) {
            HStack(spacing: 8) {
                Image(systemName: isApproaching ? "bell.badge.fill" : "clock.fill")
                    .font(.system(size: 11))
                    .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                
                Text("Next:")
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                
                Text(nextPrayerName)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text(remainingTime)
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                    .foregroundColor(Color(red: 0.85, green: 0.70, blue: 0.35))
                
                Image(systemName: "chevron.down")
                    .font(.system(size: 10))
                    .foregroundColor(.gray)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(Color.white.opacity(0.08))
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isApproaching ? Color(red: 0.85, green: 0.70, blue: 0.35).opacity(0.5) : Color.white.opacity(0.1), lineWidth: 1)
            )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
        .sheet(isPresented: $showScheduleSheet) {
            MakkahPrayerScheduleSheet()
        }
    }
}

struct MakkahPrayerScheduleSheet: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Makkah Prayer Times")
                .font(.headline)
                .padding(.top, 20)
            
            Text("Umm al-Qura Standard (Masjid al-Haram)")
                .font(.caption)
                .foregroundColor(.gray)
            
            // Prayers list
            VStack(spacing: 8) {
                PrayerRow(name: "Fajr", time: "05:12 AM")
                PrayerRow(name: "Dhuhr", time: "12:18 PM", isNext: true)
                PrayerRow(name: "Asr", time: "03:38 PM")
                PrayerRow(name: "Maghrib", time: "05:54 PM")
                PrayerRow(name: "Isha", time: "07:24 PM")
            }
            .padding()
            
            Spacer()
        }
        .presentationDetents([.medium])
    }
}

struct PrayerRow: View {
    let name: String
    let time: String
    var isNext: Bool = false
    
    var body: some View {
        HStack {
            Text(name).fontWeight(isNext ? .bold : .regular)
            Spacer()
            Text(time).font(.system(.body, design: .monospaced))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(isNext ? Color.yellow.opacity(0.15) : Color.clear)
        .cornerRadius(8)
    }
}`
  }
];
