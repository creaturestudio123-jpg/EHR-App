// Demo data for testing the offline storage system
import { offlineStorage, type Patient, type HealthRecord, type Reminder } from "@/lib/offline-storage"

export async function seedDemoData() {
  try {
    // Check if data already exists
    const existingPatients = await offlineStorage.getPatients()
    if (existingPatients.length > 0) {
      console.log("Demo data already exists")
      return
    }

    console.log("Seeding demo data...")

    // Demo patients
    const demoPatients: Omit<Patient, "id" | "createdAt" | "updatedAt" | "syncStatus">[] = [
      {
        name: "Sunita Devi",
        age: 28,
        gender: "female",
        phone: "9876543001",
        address: "House No. 45, Main Road",
        village: "Rampur",
        ashaWorkerId: "1",
      },
      {
        name: "Raj Kumar",
        age: 35,
        gender: "male",
        phone: "9876543002",
        address: "Near Temple, Ward 3",
        village: "Rampur",
        ashaWorkerId: "1",
      },
      {
        name: "Meera Sharma",
        age: 22,
        gender: "female",
        phone: "9876543003",
        address: "Behind School, Ward 1",
        village: "Rampur",
        ashaWorkerId: "1",
      },
    ]

    // Add demo patients
    const addedPatients = []
    for (const patientData of demoPatients) {
      const patient = await offlineStorage.addPatient(patientData)
      addedPatients.push(patient)
    }

    // Demo health records
    const now = new Date()
    const demoRecords: Omit<HealthRecord, "id" | "createdAt" | "updatedAt" | "syncStatus">[] = [
      {
        patientId: addedPatients[0].id,
        type: "anc",
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        notes: "Regular ANC checkup. All vitals normal.",
        vitals: {
          weight: 65,
          bloodPressure: "120/80",
          temperature: 98.6,
        },
        ancData: {
          gestationWeeks: 24,
          nextVisitDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
        },
        recordedBy: "1",
      },
      {
        patientId: addedPatients[1].id,
        type: "vaccination",
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: "Tetanus vaccination administered.",
        vaccinations: [
          {
            vaccine: "Tetanus",
            dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            givenDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            status: "given",
          },
        ],
        recordedBy: "1",
      },
      {
        patientId: addedPatients[2].id,
        type: "general_checkup",
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: "General health checkup. Patient reports mild fever.",
        vitals: {
          weight: 55,
          temperature: 100.2,
          bloodPressure: "110/70",
        },
        recordedBy: "1",
      },
    ]

    // Add demo health records
    for (const recordData of demoRecords) {
      await offlineStorage.addHealthRecord(recordData)
    }

    // Demo reminders
    const demoReminders: Omit<Reminder, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId: addedPatients[0].id,
        type: "anc",
        title: "ANC Checkup Due",
        description: "Next antenatal checkup scheduled",
        dueDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
        status: "pending",
        createdBy: "1",
      },
      {
        patientId: addedPatients[1].id,
        type: "vaccination",
        title: "Hepatitis B Due",
        description: "Second dose of Hepatitis B vaccination",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: "pending",
        createdBy: "1",
      },
      {
        patientId: addedPatients[2].id,
        type: "follow_up",
        title: "Fever Follow-up",
        description: "Check on fever symptoms",
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: "pending",
        createdBy: "1",
      },
    ]

    // Add demo reminders
    for (const reminderData of demoReminders) {
      await offlineStorage.addReminder(reminderData)
    }

    console.log("Demo data seeded successfully!")
  } catch (error) {
    console.error("Error seeding demo data:", error)
  }
}
