import { SchoolYear, Semester, Subject, PracticeSet, DEFAULT_SCHOOL_YEARS, DEFAULT_SEMESTERS, DEFAULT_TERMS } from '../types/exam';

export { DEFAULT_SCHOOL_YEARS, DEFAULT_SEMESTERS, DEFAULT_TERMS };

export const DEFAULT_SUBJECTS: Subject[] = [
  // 3rd Year - 1st Semester
  {
    id: 'sub-comm',
    yearId: 'year-3',
    semesterId: 'sem-1',
    title: 'Communication Systems',
    description: 'Analog to Digital Conversion, Modulation (ASK/FSK/PSK), Nyquist Rate, Shannon Capacity & Noise.',
    iconName: 'Radio',
    color: 'indigo',
  },
  {
    id: 'sub-java',
    yearId: 'year-3',
    semesterId: 'sem-1',
    title: 'Java Programming & OOP',
    description: 'Object-Oriented Design, JVM Internals, Polymorphism, Collections Framework & Exception Handling.',
    iconName: 'Code2',
    color: 'amber',
  },
  {
    id: 'sub-dsa',
    yearId: 'year-3',
    semesterId: 'sem-1',
    title: 'Data Structures & Algorithms',
    description: 'Binary Search Trees, Graph Traversals, Dynamic Programming, Asymptotic Complexity & Heaps.',
    iconName: 'Binary',
    color: 'emerald',
  },

  // 3rd Year - 2nd Semester
  {
    id: 'sub-os',
    yearId: 'year-3',
    semesterId: 'sem-2',
    title: 'Operating Systems',
    description: 'Kernel Processes, CPU Scheduling, Mutex/Semaphores, Paging, Virtual Memory & Deadlocks.',
    iconName: 'Cpu',
    color: 'violet',
  },
  {
    id: 'sub-dbms',
    yearId: 'year-3',
    semesterId: 'sem-2',
    title: 'Database Systems',
    description: 'Relational Algebra, SQL Optimization, 3NF/BCNF Normalization, ACID Transactions & Indexing.',
    iconName: 'Database',
    color: 'cyan',
  },
  {
    id: 'sub-net',
    yearId: 'year-3',
    semesterId: 'sem-2',
    title: 'Computer Networks',
    description: 'TCP/IP Protocol Stack, Sliding Window, BGP/OSPF Routing, Subnetting, Socket Programming & TLS.',
    iconName: 'Network',
    color: 'rose',
  },
];

export const DEFAULT_PRACTICE_SETS: PracticeSet[] = [
  // --- 1. Communication Systems (EC401) - 3rd Year 1st Sem ---
  // PRELIMS
  {
    id: 'set-comm-prelim',
    subjectId: 'sub-comm',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'prelims',
    title: 'Prelims: Signals, Spectra & Analog Transmission',
    description: 'Foundational concepts on Fourier spectrum, signal bandwidth, AM/FM modulation indices, and noise calculation.',
    timeLimitMinutes: 20,
    passingScorePercent: 60,
    questions: [
      {
        id: 'comm-p1',
        sectionTitle: 'Sec A: Fundamentals',
        questionText: 'What is the modulation index (m) of an Amplitude Modulated (AM) signal if the peak carrier amplitude is 10V and the peak modulating signal amplitude is 8V?',
        codeSnippet: `Carrier Ac = 10 V
Modulating signal Am = 8 V
Modulation index m = Am / Ac = ?`,
        options: [
          '0.5',
          '0.8',
          '1.25',
          '1.8'
        ],
        correctIndex: 1,
        keyConcept: 'AM Modulation Index',
        explanation: 'The modulation index is defined as m = Am / Ac. Here m = 8 / 10 = 0.8 (or 80%). When m <= 1, the envelope remains distortion-free and can be demodulated with a simple envelope detector.',
        difficulty: 'easy'
      },
      {
        id: 'comm-p2',
        sectionTitle: 'Sec A: Fundamentals',
        questionText: 'Under Carson\'s rule, what is the approximate transmission bandwidth required for a Frequency Modulated (FM) signal with peak frequency deviation Δf and maximum modulating frequency fm?',
        options: [
          'BW = 2 * (Δf + fm)',
          'BW = Δf + 2fm',
          'BW = 2 * Δf * fm',
          'BW = Δf / fm'
        ],
        correctIndex: 0,
        keyConcept: 'Carson\'s Rule for FM Bandwidth',
        explanation: 'Carson’s bandwidth rule states that FM bandwidth BW ≈ 2 * (Δf + fm). This accounts for 98% of the total transmitted power contained in the significant sidebands of the Bessel functions.',
        difficulty: 'medium'
      },
      {
        id: 'comm-p3',
        sectionTitle: 'Sec B: Applied Analysis',
        questionText: 'Thermal noise power (Johnson noise) in an electronic resistor of resistance R at temperature T Kelvin over bandwidth B Hz is calculated as:',
        options: [
          'Pn = k * T * B',
          'Pn = (k * T) / B',
          'Pn = k * T * R',
          'Pn = 4 * k * T'
        ],
        correctIndex: 0,
        keyConcept: 'Johnson-Nyquist Thermal Noise',
        explanation: 'Available thermal noise power delivered to a matched load is Pn = k * T * B, where k is Boltzmann’s constant (1.38 x 10^-23 J/K), T is temperature in Kelvin, and B is noise bandwidth in Hz.',
        difficulty: 'medium'
      }
    ]
  },

  // MIDTERMS
  {
    id: 'set-comm-midterm',
    subjectId: 'sub-comm',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'midterms',
    title: 'Midterms: Modulation, Bandwidth & Nyquist Principles',
    description: 'Digital conversion, pulse code modulation, Nyquist sampling criterion, and Shannon channel capacity.',
    timeLimitMinutes: 20,
    passingScorePercent: 65,
    questions: [
      {
        id: 'comm-m1',
        sectionTitle: 'Sec A: Sampling & Quantization',
        questionText: 'According to the Nyquist Sampling Theorem, to faithfully reconstruct an analog continuous-time signal with a maximum bandwidth of B Hz, what is the theoretical minimum sampling frequency (fs)?',
        options: [
          'fs = B / 2',
          'fs = B',
          'fs = 2B',
          'fs = 4B'
        ],
        correctIndex: 2,
        keyConcept: 'Nyquist Sampling Criterion',
        explanation: 'The Nyquist rate states that the sampling rate must be at least twice the highest frequency component (fs >= 2B) contained in the bandlimited signal to prevent aliasing overlap.',
        difficulty: 'easy'
      },
      {
        id: 'comm-m2',
        sectionTitle: 'Sec A: Sampling & Quantization',
        questionText: 'Under the Shannon-Hartley theorem, the channel capacity C (in bits/sec) for an additive white Gaussian noise (AWGN) channel is expressed as:',
        options: [
          'C = B * log2(1 + SNR)',
          'C = 2B * log10(1 + SNR)',
          'C = B / log2(SNR)',
          'C = B * (1 + SNR)^2'
        ],
        correctIndex: 0,
        keyConcept: 'Shannon Channel Capacity',
        explanation: 'Shannon capacity formula is C = B * log2(1 + SNR), where B is the channel bandwidth in Hertz and SNR is the signal-to-noise power ratio.',
        difficulty: 'medium'
      },
      {
        id: 'comm-m3',
        sectionTitle: 'Sec B: Digital Keying Schemes',
        questionText: 'Which digital modulation technique alters the phase of the carrier signal abruptly between distinct states while maintaining a constant envelope amplitude?',
        options: [
          'Amplitude Shift Keying (ASK)',
          'Phase Shift Keying (PSK)',
          'Frequency Shift Keying (FSK)',
          'Pulse Amplitude Modulation (PAM)'
        ],
        correctIndex: 1,
        keyConcept: 'Phase Shift Keying (PSK)',
        explanation: 'In Phase Shift Keying (such as BPSK or QPSK), the carrier amplitude remains constant while the phase shifts by predetermined angles, preventing non-linear amplifier distortion.',
        difficulty: 'easy'
      },
      {
        id: 'comm-m4',
        sectionTitle: 'Sec B: Digital Keying Schemes',
        questionText: 'A voice channel is limited to a band of 4 kHz. If sampled at 8,000 samples/sec with 8-bit PCM encoding, what is the resulting bit rate of the digitized stream?',
        codeSnippet: `fs = 8,000 samples/sec
n = 8 bits/sample
Bitrate R = fs * n = ?`,
        options: [
          '32 kbps',
          '64 kbps',
          '128 kbps',
          '256 kbps'
        ],
        correctIndex: 1,
        keyConcept: 'PCM Bitrate Calculation',
        explanation: 'Bitrate R = fs * n = 8,000 samples/second * 8 bits/sample = 64,000 bits/second = 64 kbps (the standard DS0 channel rate).',
        difficulty: 'easy'
      }
    ]
  },

  // PREFINALS
  {
    id: 'set-comm-prefinals',
    subjectId: 'sub-comm',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'prefinals',
    title: 'Prefinals: Multiplexing, Spread Spectrum & Eye Diagrams',
    description: 'TDM, FDM, CDMA orthogonal Walsh codes, ISI minimization with raised-cosine filters, and oscilloscope eye patterns.',
    timeLimitMinutes: 20,
    passingScorePercent: 65,
    questions: [
      {
        id: 'comm-pf1',
        sectionTitle: 'Sec A: Multiple Access',
        questionText: 'Which multiplexing technique assigns unique mathematical orthogonal pseudo-random code sequences to each user sharing the exact same frequency band simultaneously?',
        options: [
          'Time Division Multiplexing (TDM)',
          'Frequency Division Multiplexing (FDM)',
          'Code Division Multiple Access (CDMA)',
          'Wavelength Division Multiplexing (WDM)'
        ],
        correctIndex: 2,
        keyConcept: 'Spread Spectrum & CDMA',
        explanation: 'In CDMA, each transmitter multiplies its data by a distinct high-chip-rate orthogonal code. The receiver cross-correlates with its assigned key; interfering users integrate to near zero.',
        difficulty: 'medium'
      },
      {
        id: 'comm-pf2',
        sectionTitle: 'Sec A: Multiple Access',
        questionText: 'In an eye diagram displayed on an oscilloscope, what does the vertical opening height at the sampling instant represent?',
        options: [
          'The carrier center frequency',
          'The noise immunity margin (noise margin)',
          'The physical cable length in meters',
          'The battery charge state'
        ],
        correctIndex: 1,
        keyConcept: 'Eye Pattern Analysis',
        explanation: 'In an eye diagram, the vertical height of the opening at the optimal decision time indicates the noise margin. A closing eye warns of excessive Intersymbol Interference (ISI) and timing jitter.',
        difficulty: 'hard'
      }
    ]
  },

  // FINALS
  {
    id: 'set-comm-finals',
    subjectId: 'sub-comm',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'finals',
    title: 'Finals: Comprehensive Communication Systems Exam',
    description: 'Comprehensive term coverage spanning Nyquist, Shannon capacity, QAM constellations, matched filters, and link budget design.',
    timeLimitMinutes: 25,
    passingScorePercent: 70,
    questions: [
      {
        id: 'comm-f1',
        sectionTitle: 'Sec A: Comprehensive Theory',
        questionText: 'A communication channel has a bandwidth of 1 MHz and an SNR of 15 (linear value). Calculate the theoretical Shannon capacity limit.',
        codeSnippet: `Bandwidth B = 1 MHz = 10^6 Hz
SNR = 15
Capacity C = B * log2(1 + 15) = ?`,
        options: [
          '1 Mbps',
          '2 Mbps',
          '4 Mbps',
          '16 Mbps'
        ],
        correctIndex: 2,
        keyConcept: 'Shannon Channel Capacity',
        explanation: 'C = B * log2(1 + SNR) = 1 MHz * log2(1 + 15) = 10^6 * log2(16) = 10^6 * 4 = 4 Mbps.',
        difficulty: 'medium'
      },
      {
        id: 'comm-f2',
        sectionTitle: 'Sec B: Advanced Modulations',
        questionText: 'What is the primary advantage of Quadrature Amplitude Modulation (QAM) over standard QPSK?',
        options: [
          'Simpler receiver circuit without carrier recovery',
          'Higher spectral efficiency by modulating both amplitude and phase simultaneously',
          'Completely eliminates AWGN noise',
          'Zero transmission delay across fiber'
        ],
        correctIndex: 1,
        keyConcept: 'QAM Spectral Efficiency',
        explanation: 'QAM modulates two orthogonal carrier waves in both amplitude and phase, transmitting more bits/sec per Hertz within a constrained bandwidth.',
        difficulty: 'medium'
      }
    ]
  },

  // --- 2. Java Programming & OOP (CS302) ---
  // PRELIMS
  {
    id: 'set-java-prelim',
    subjectId: 'sub-java',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'prelims',
    title: 'Prelims: OOP Principles & JVM Memory Architecture',
    description: 'Dynamic method dispatch, heap vs stack memory, equals/hashCode contracts, and object initialization.',
    timeLimitMinutes: 20,
    passingScorePercent: 65,
    questions: [
      {
        id: 'java-p1',
        sectionTitle: 'Sec A: OOP Foundations',
        questionText: 'In Java, what happens during execution if a subclass overrides a non-static method and you invoke it through a reference of the superclass type?',
        codeSnippet: `Animal a = new Dog();
a.makeSound(); // Dog overrides Animal's method`,
        options: [
          'Compile-time error: Animal reference cannot invoke Dog methods',
          'Animal\'s version executes because the reference type is Animal',
          'Dog\'s version executes due to virtual method invocation (dynamic dispatch)',
          'Throws java.lang.ClassCastException at runtime'
        ],
        correctIndex: 2,
        keyConcept: 'Dynamic Method Dispatch',
        explanation: 'In Java, non-static methods are virtual by default. Dynamic dispatch executes the overriding method based on the actual object stored on the heap (Dog) at runtime.',
        difficulty: 'easy'
      },
      {
        id: 'java-p2',
        sectionTitle: 'Sec A: OOP Foundations',
        questionText: 'Which JVM memory area holds object instances created via the new keyword?',
        options: [
          'Java Stack',
          'Heap Memory',
          'Program Counter (PC) Register',
          'Native Method Stack'
        ],
        correctIndex: 1,
        keyConcept: 'JVM Memory Architecture',
        explanation: 'All object instances and their instance variables are allocated on the Heap. The Java Stack only stores thread execution frames and primitive local variables.',
        difficulty: 'easy'
      },
      {
        id: 'java-p3',
        sectionTitle: 'Sec B: String Internals',
        questionText: 'What is the output of the following Java snippet?',
        codeSnippet: `String s1 = "ReviseIQ";
String s2 = new String("ReviseIQ");
System.out.println((s1 == s2) + " " + s1.equals(s2));`,
        options: [
          'true true',
          'false false',
          'false true',
          'true false'
        ],
        correctIndex: 2,
        keyConcept: 'String Constant Pool vs Heap',
        explanation: 's1 points to an interned string in the String Pool, whereas "new String(...)" forces a new heap instance. Hence reference equality (s1 == s2) is false, while value equality (s1.equals(s2)) is true.',
        difficulty: 'easy'
      }
    ]
  },

  // MIDTERMS
  {
    id: 'set-java-midterm',
    subjectId: 'sub-java',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'midterms',
    title: 'Midterms: Collections, Generics & Exception Hierarchies',
    description: 'HashMap bucket hashing, type erasure in generics, checked vs unchecked exceptions, and comparable/comparator.',
    timeLimitMinutes: 20,
    passingScorePercent: 70,
    questions: [
      {
        id: 'java-m1',
        sectionTitle: 'Sec A: Collections & Hash Contracts',
        questionText: 'What is the contract between equals() and hashCode() according to java.lang.Object documentation?',
        options: [
          'If two objects have equal hash codes, their equals() must always return true',
          'If two objects are equal according to equals(), their hashCode() must return the same integer',
          'There is no required relationship between the two methods',
          'hashCode() must return a negative value if equals() is false'
        ],
        correctIndex: 1,
        keyConcept: 'equals() and hashCode() Contract',
        explanation: 'If obj1.equals(obj2) is true, then obj1.hashCode() MUST equal obj2.hashCode(). Violating this causes silent lookup failures when placing objects into HashMaps or HashSets.',
        difficulty: 'medium'
      },
      {
        id: 'java-m2',
        sectionTitle: 'Sec B: Generics & Immutability',
        questionText: 'Which of the following classes is inherently IMMUTABLE in the standard Java JDK?',
        options: [
          'java.lang.StringBuilder',
          'java.util.Date',
          'java.lang.String and java.time.LocalDate',
          'java.util.ArrayList'
        ],
        correctIndex: 2,
        keyConcept: 'Immutability in Java',
        explanation: 'java.lang.String and Java 8 Time API classes (such as LocalDate) are immutable: their internal state cannot be modified after construction.',
        difficulty: 'medium'
      }
    ]
  },

  // --- 3. Data Structures & Algorithms (CS301) - 3rd Year 1st Sem ---
  // MIDTERMS
  {
    id: 'set-dsa-midterm',
    subjectId: 'sub-dsa',
    yearId: 'year-3',
    semesterId: 'sem-1',
    termId: 'midterms',
    title: 'Midterms: Trees, Graphs, DP & Asymptotic Complexity',
    description: 'BST balance factors, Breadth-First Search shortest paths, Dijkstra negative weight caveats, and Kruskal complexity.',
    timeLimitMinutes: 20,
    passingScorePercent: 65,
    questions: [
      {
        id: 'dsa-m1',
        sectionTitle: 'Sec A: Tree Traversals & Heights',
        questionText: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) containing n elements?',
        options: [
          'O(1)',
          'O(log n)',
          'O(n)',
          'O(n log n)'
        ],
        correctIndex: 2,
        keyConcept: 'BST Degeneration',
        explanation: 'When keys are inserted in sorted order, an ordinary BST degenerates into a linear linked-list structure with height n, leading to O(n) search time.',
        difficulty: 'easy'
      },
      {
        id: 'dsa-m2',
        sectionTitle: 'Sec B: Graph Algorithms',
        questionText: 'Dijkstra’s algorithm for finding single-source shortest paths FAILS or produces incorrect results when graph edges have:',
        options: [
          'Cycles',
          'Weights larger than 1000',
          'Negative edge weights',
          'Directed edges'
        ],
        correctIndex: 2,
        keyConcept: 'Dijkstra Greediness & Negative Weights',
        explanation: 'Dijkstra relies on a greedy invariant: once a vertex distance is popped as minimized, it is never updated again. Negative weights invalidate this assumption.',
        difficulty: 'medium'
      }
    ]
  },

  // --- 4. Operating Systems (CS402) - 3rd Year 2nd Sem ---
  // PREFINALS
  {
    id: 'set-os-prefinals',
    subjectId: 'sub-os',
    yearId: 'year-3',
    semesterId: 'sem-2',
    termId: 'prefinals',
    title: 'Prefinals: Process Scheduling, Synchronization & Virtual Memory',
    description: 'CPU schedulers, Convoy effect, Coffman deadlock conditions, Belady anomaly in FIFO, and TLB caches.',
    timeLimitMinutes: 20,
    passingScorePercent: 60,
    questions: [
      {
        id: 'os-pf1',
        sectionTitle: 'Sec A: CPU Scheduling',
        questionText: 'Which CPU scheduling algorithm can suffer from the "Convoy Effect", where short processes get stuck waiting behind one long CPU-bound process?',
        options: [
          'First-Come, First-Served (FCFS)',
          'Shortest Job First (SJF)',
          'Round Robin (RR)',
          'Multi-Level Feedback Queue (MLFQ)'
        ],
        correctIndex: 0,
        keyConcept: 'FCFS Convoy Effect',
        explanation: 'In non-preemptive FCFS scheduling, if a long CPU-intensive process executes first, all shorter I/O-bound jobs wait in the ready queue, resulting in poor CPU and device utilization.',
        difficulty: 'easy'
      },
      {
        id: 'os-pf2',
        sectionTitle: 'Sec B: Memory & Deadlocks',
        questionText: 'Which of the following is NOT one of the four necessary Coffman conditions for a system deadlock to occur?',
        options: [
          'Mutual Exclusion',
          'Hold and Wait',
          'Preemption Allowed',
          'Circular Wait'
        ],
        correctIndex: 2,
        keyConcept: 'Coffman Deadlock Conditions',
        explanation: 'The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Allowing preemption breaks deadlock.',
        difficulty: 'medium'
      }
    ]
  },

  // --- 5. Database Systems (CS501) - 3rd Year 2nd Sem ---
  // FINALS
  {
    id: 'set-dbms-finals',
    subjectId: 'sub-dbms',
    yearId: 'year-3',
    semesterId: 'sem-2',
    termId: 'finals',
    title: 'Finals: Relational Model, Normalization & ACID Transactions',
    description: 'Boyce-Codd Normal Form, ACID durability with WAL, transaction isolation levels, and B+ Tree indexing.',
    timeLimitMinutes: 20,
    passingScorePercent: 65,
    questions: [
      {
        id: 'db-f1',
        sectionTitle: 'Sec A: Normalization',
        questionText: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
        options: [
          'Y is a prime attribute',
          'X is a superkey of the relation',
          'X and Y belong to the same domain',
          'The relation has at most two attributes'
        ],
        correctIndex: 1,
        keyConcept: 'Boyce-Codd Normal Form (BCNF)',
        explanation: 'BCNF is stricter than 3NF. In 3NF, X -> Y is allowed if X is a superkey OR Y is a prime attribute. BCNF eliminates that second exception: every determinant X MUST be a superkey.',
        difficulty: 'medium'
      },
      {
        id: 'db-f2',
        sectionTitle: 'Sec B: Transactions & Storage',
        questionText: 'Which ACID property guarantees that once a transaction commits, its modifications are permanently recorded even in the event of an immediate system crash or power outage?',
        options: [
          'Atomicity',
          'Consistency',
          'Isolation',
          'Durability'
        ],
        correctIndex: 3,
        keyConcept: 'ACID Durability',
        explanation: 'Durability ensures that committed transaction effects survive hardware crashes, accomplished via Write-Ahead Logging (WAL) and disk flush checkpoints.',
        difficulty: 'easy'
      }
    ]
  }
];
