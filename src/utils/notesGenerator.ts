import { NotebookPoint, ExpectedQuestion, ConciseNote } from '../types';

export interface GeneratedNotebookNote {
  title: string;
  summary: string;
  points: NotebookPoint[];
  expectedQuestions: ExpectedQuestion[];
  subjectId: string;
  tags: string[];
}

// Curated high-yield CSE topic blueprints
const TOPIC_KNOWLEDGE_BASE: Record<
  string,
  {
    summary: string;
    points: { category: string; point: string }[];
    questions: { marks: string; question: string; answer: string }[];
    subjectId: string;
    tags: string[];
  }
> = {
  banker: {
    summary:
      "Banker's Algorithm is a resource allocation and deadlock avoidance algorithm developed by Edsger Dijkstra. It dynamically checks system safety by simulating the allocation of declared maximum resources to verify that at least one safe execution sequence exists before granting any resource request.",
    points: [
      {
        category: 'Key Concept & Definition',
        point: "Safe State: A system state is safe if there exists at least one safe sequence <P0, P1, ..., Pn> where each process can satisfy its maximum demand and terminate without causing deadlock.",
      },
      {
        category: 'Key Concept & Definition',
        point: 'Need Matrix Formula: Need[i][j] = Max[i][j] - Allocation[i][j] for all processes i and resources j.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Step 1: Process Pi makes a request Request_i. If Request_i <= Need_i, proceed; otherwise raise an error (exceeded maximum claim).',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Step 2: If Request_i <= Available, simulate provisional allocation: Available = Available - Request_i; Allocation_i = Allocation_i + Request_i; Need_i = Need_i - Request_i.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Step 3: Run Safety Algorithm with Work = Available and Finish[i] = false. Find process Pi where Finish[i] == false and Need_i <= Work. If found, set Work = Work + Allocation_i, Finish[i] = true, and append Pi to safe sequence.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Time Complexity of Safety Algorithm: O(m * n^2), where n is the number of processes and m is the number of resource types.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Invariant: An unsafe state is NOT synonymous with deadlock; an unsafe state merely carries the potential for deadlock if processes demand their full declared maximum.',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Exam Trap: Never forget to release ALL resources of a finished process back into the Work vector: Work = Work + Allocation[i].',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Real-world Limitation: Banker’s algorithm is rarely used in generic operating systems (like Linux or Windows) because processes cannot declare their exact maximum resource demands in advance.',
      },
    ],
    questions: [
      {
        marks: '2 Marks',
        question: "Define 'Safe State' in Banker's Algorithm and write the relation between Need, Max, and Allocation.",
        answer: 'A state is safe if there exists a safe sequence of processes such that each process can complete its execution using current available resources plus resources freed by prior processes. Formula: Need[i][j] = Max[i][j] - Allocation[i][j].',
      },
      {
        marks: '5 Marks',
        question: "Explain the Resource-Request Algorithm in Banker's deadlock avoidance with its condition checks.",
        answer: 'When process Pi requests resources: 1. Verify Request_i <= Need_i (cannot exceed max claim). 2. Verify Request_i <= Available (cannot exceed physical stock; else Pi must wait). 3. Provisionally simulate allocation by updating Available, Allocation, and Need. 4. Run Safety algorithm: if state remains safe, grant request; if unsafe, rollback changes and make Pi wait.',
      },
      {
        marks: '10 Marks',
        question: 'Given 5 processes (P0 to P4) and 3 resource types (A, B, C), describe how to determine whether the system is in a safe state and derive the safe sequence.',
        answer: '1. Compute Need Matrix = Max - Allocation for each process. 2. Initialize Work = Available, Finish[0..4] = false. 3. Iteratively locate an unfinished process whose Need <= Work. 4. Free its allocated resources: Work += Allocation, mark Finish = true. 5. If all Finish[i] == true, system is in safe state and sequence is valid.',
      },
      {
        marks: 'Viva / Interview',
        question: 'Does entering an unsafe state guarantee that a deadlock has occurred?',
        answer: 'No. An unsafe state means the OS cannot guarantee deadlock prevention under worst-case requests. Deadlock only occurs if processes actually demand their maximum claimed resources concurrently.',
      },
    ],
    subjectId: 'sub-2',
    tags: ['OS', 'Deadlocks', 'Banker Algorithm', 'Safe State', 'Midsem Prep'],
  },

  bcnf: {
    summary:
      'Boyce-Codd Normal Form (BCNF) is an advanced relational database normalization standard that is strictly stronger than Third Normal Form (3NF). A relation is in BCNF if and only if for every non-trivial functional dependency X -> Y, the determinant X is a Superkey.',
    points: [
      {
        category: 'Key Concept & Definition',
        point: 'BCNF Rule: For every non-trivial functional dependency X -> Y in F+, the left-hand side determinant X MUST be a Superkey of the relation.',
      },
      {
        category: 'Key Concept & Definition',
        point: 'Difference from 3NF: In 3NF, for X -> Y, either X is a superkey OR Y is a prime attribute. BCNF completely removes the second allowance ("Y is prime"), eliminating all redundancy from non-superkey determinants.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Decomposition Step 1: Identify an FD X -> Y where X is NOT a superkey.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Decomposition Step 2: Compute closure X+. Decompose relation R into R1 = X+ and R2 = (R - X+) U X.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Decomposition Step 3: Check if decomposed relations are in BCNF. If an FD violation remains in any sub-relation, repeat decomposition recursively.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Lossless Join Guarantee: BCNF decomposition ALWAYS guarantees a lossless join because R1 ∩ R2 = X, and X is a superkey in R1.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Dependency Preservation Trade-off: BCNF decomposition does NOT always preserve all functional dependencies (unlike 3NF, which always preserves dependencies).',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Exam Trap: Any binary relation (relation with exactly 2 attributes) is ALWAYS in BCNF.',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Rule of Thumb: If you must preserve all functional dependencies and avoid cross-table joins for constraint validation, use 3NF; if you must eliminate all update anomalies, use BCNF.',
      },
    ],
    questions: [
      {
        marks: '2 Marks',
        question: 'State the formal definition of Boyce-Codd Normal Form (BCNF).',
        answer: 'A relation R is in BCNF if for every non-trivial functional dependency X -> Y in F+, the determinant X is a superkey of relation R.',
      },
      {
        marks: '5 Marks',
        question: 'Differentiate between 3NF and BCNF with a suitable example.',
        answer: 'In 3NF, for X -> Y, either X is a superkey OR Y is a prime attribute. In BCNF, X must strictly be a superkey without exception. For example, in R(Student, Course, Instructor) where {Student, Course} is candidate key and Instructor -> Course holds: this is in 3NF (Course is prime) but NOT in BCNF because Instructor is not a superkey.',
      },
      {
        marks: '10 Marks',
        question: 'Explain the algorithm for Lossless BCNF decomposition and discuss why dependency preservation is not guaranteed.',
        answer: 'Algorithm: 1. Check if R is in BCNF. 2. If FD X -> Y violates BCNF, partition R into R1 = (X U Y) and R2 = (R - Y). 3. The join is lossless because R1 ∩ R2 = X, which is a superkey of R1. 4. Dependencies spanning across R1 and R2 may be lost because individual tables cannot enforce cross-table functional dependencies without costly join operations.',
      },
      {
        marks: 'Viva / Interview',
        question: 'Can every relational schema be decomposed into BCNF with dependency preservation?',
        answer: 'No. While every schema can be decomposed into BCNF losslessly, preserving all functional dependencies simultaneously is not always mathematically possible in BCNF. (3NF guarantees both lossless join and dependency preservation).',
      },
    ],
    subjectId: 'sub-3',
    tags: ['DBMS', 'BCNF', 'Normalization', 'Functional Dependencies', 'GATE CSE'],
  },

  tcp: {
    summary:
      'The Transmission Control Protocol (TCP) is a connection-oriented, reliable transport-layer protocol providing full-duplex byte stream service. It guarantees in-order delivery, error detection, flow control (sliding window), and network congestion control (AIMD).',
    points: [
      {
        category: 'Key Concept & Definition',
        point: 'Connection-Oriented: TCP requires establishing a logical end-to-end connection before transmitting payload data using a 3-Way Handshake.',
      },
      {
        category: 'How It Works / Mechanism',
        point: '3-Way Handshake Step 1: Client sends SYN packet with initial sequence number seq = x (SYN = 1, ACK = 0).',
      },
      {
        category: 'How It Works / Mechanism',
        point: '3-Way Handshake Step 2: Server responds with SYN-ACK packet: seq = y, ack = x + 1 (SYN = 1, ACK = 1).',
      },
      {
        category: 'How It Works / Mechanism',
        point: '3-Way Handshake Step 3: Client replies with ACK packet: seq = x + 1, ack = y + 1 (SYN = 0, ACK = 1). Connection is now ESTABLISHED.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Connection Teardown (4-Way Handshake): Initiated by sending FIN packet; acknowledged with ACK; other side sends FIN; finalized with final ACK and TIME_WAIT (2*MSL).',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Effective Window Size = min(Receiver Window rwnd, Congestion Window cwnd). Prevents receiver buffer overflow and network bottleneck congestion.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'AIMD Congestion Control: Additive Increase (cwnd += 1 MSS per RTT during congestion avoidance) and Multiplicative Decrease (cwnd = cwnd / 2 upon packet loss).',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Exam Trap: SYN packets consume 1 sequence number even though they carry 0 bytes of payload data.',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Fast Retransmit: Triggered immediately when the sender receives 3 duplicate ACKs for the same packet, without waiting for the retransmission timeout timer (RTO) to expire.',
      },
    ],
    questions: [
      {
        marks: '2 Marks',
        question: 'Why does the TCP 3-Way Handshake require 3 messages instead of 2?',
        answer: 'To ensure both client and server mutually verify that the other party can receive and send data, and to prevent delayed duplicate SYN packets from earlier aborted sessions from establishing false connections.',
      },
      {
        marks: '5 Marks',
        question: 'Explain TCP Congestion Control phases: Slow Start, Congestion Avoidance, and Fast Recovery.',
        answer: '1. Slow Start: cwnd starts at 1 MSS and doubles every RTT (exponential growth) until it reaches ssthresh. 2. Congestion Avoidance: cwnd grows linearly (+1 MSS per RTT) via additive increase. 3. Fast Recovery: Triggered by 3 duplicate ACKs, ssthresh = cwnd / 2, cwnd = ssthresh + 3 MSS, skips slow start.',
      },
      {
        marks: '10 Marks',
        question: 'Detail the connection establishment and connection termination mechanisms in TCP with sequence numbers and state diagrams.',
        answer: 'Detail the 3-Way Handshake (CLOSED -> LISTEN -> SYN_SENT -> SYN_RCVD -> ESTABLISHED) with SYN(seq=x), SYN+ACK(seq=y, ack=x+1), ACK(ack=y+1). Detail 4-way FIN termination (ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED) with FIN, ACK, FIN, ACK, explaining the 2*MSL timer.',
      },
      {
        marks: 'Viva / Interview',
        question: 'What is the purpose of the TIME_WAIT state at the active closer?',
        answer: 'It waits for 2*MSL (Maximum Segment Lifetime) to ensure the final ACK reached the passive closer (retransmitting if lost) and to allow any stray duplicate packets in the network to die out before reusing port numbers.',
      },
    ],
    subjectId: 'sub-4',
    tags: ['Computer Networks', 'TCP', '3-Way Handshake', 'Congestion Control', 'Viva Prep'],
  },

  dijkstra: {
    summary:
      "Dijkstra's Algorithm is a greedy single-source shortest path algorithm on weighted graphs with non-negative edge weights. It iteratively selects the vertex with the minimum tentative distance, updates the distances of its unvisited neighbors, and marks it as permanently visited.",
    points: [
      {
        category: 'Key Concept & Definition',
        point: 'Objective: Computes shortest paths from a designated single source vertex s to all other vertices in a directed or undirected graph with edge weights w(u, v) >= 0.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Initialization: Set dist[source] = 0 and dist[v] = ∞ for all other vertices v != source. Push (0, source) into a Min-Priority Queue.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Greedy Selection: Extract vertex u with smallest dist[u] from priority queue. Mark u as visited (finalized).',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Edge Relaxation: For each unvisited neighbor v of u: If dist[u] + weight(u, v) < dist[v], update dist[v] = dist[u] + weight(u, v) and push (dist[v], v) into queue.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Time Complexity with Min-Heap / Priority Queue: O((V + E) log V). Space Complexity: O(V + E) for adjacency list and distance array.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Greedy Invariant: Once a vertex is extracted from the min-heap, its shortest distance from the source is permanently determined and will never decrease.',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'FATAL EXAM TRAP: Dijkstra fails completely when graphs have NEGATIVE edge weights or negative cycles! Use Bellman-Ford algorithm (O(V * E)) instead for negative weights.',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Fibonacci Heap Optimization: With a Fibonacci heap, Decrease-Key runs in O(1) amortized, reducing runtime to O(E + V log V).',
      },
    ],
    questions: [
      {
        marks: '2 Marks',
        question: "Why does Dijkstra's algorithm fail when edge weights are negative?",
        answer: 'Dijkstra assumes that adding an edge to a path can only increase its cost (greedy invariant). With negative weights, a visited vertex thought to be minimal could have a shorter path found later via a negative edge, breaking the invariant.',
      },
      {
        marks: '5 Marks',
        question: 'Explain the Relaxation condition in Dijkstra with code or pseudocode.',
        answer: 'Relaxation tests whether going through u improves the shortest known distance to v: if (dist[u] + weight(u, v) < dist[v]) { dist[v] = dist[u] + weight(u, v); parent[v] = u; pq.push({dist[v], v}); }',
      },
      {
        marks: '10 Marks',
        question: 'Write the complete Dijkstra algorithm using a Min-Heap and derive its time complexity step by step.',
        answer: 'Derivation: 1. Inserting V vertices into heap takes O(V log V). 2. Extract-Min is called V times, each taking O(log V) -> O(V log V). 3. Each edge is traversed once in adjacency list, resulting in at most E decrease-key/insert operations taking O(log V) each -> O(E log V). Total time: O((V + E) log V).',
      },
      {
        marks: 'Viva / Interview',
        question: 'How does Dijkstra differ from Prim’s algorithm for Minimum Spanning Tree (MST)?',
        answer: 'Dijkstra minimizes the cumulative distance from the source root to each vertex (dist[v] = dist[u] + w), whereas Prim’s minimizes the single edge weight needed to connect a new vertex to the growing tree (key[v] = w(u, v)).',
      },
    ],
    subjectId: 'sub-1',
    tags: ['DSA', 'Graphs', 'Dijkstra', 'Shortest Path', 'LeetCode'],
  },

  paging: {
    summary:
      'Paging is a memory management scheme that eliminates the need for contiguous physical memory allocation. Physical memory is divided into fixed-size frames, and logical address space is divided into equal-sized pages. A hardware Page Table and Translation Lookaside Buffer (TLB) translate virtual addresses to physical addresses.',
    points: [
      {
        category: 'Key Concept & Definition',
        point: 'Paging Basics: Virtual address is split into two components: Page Number (p) and Offset (d). Physical address is Frame Number (f) and Offset (d).',
      },
      {
        category: 'Key Concept & Definition',
        point: 'Fragmentation: Paging completely eliminates External Fragmentation, but can incur Internal Fragmentation (at most Page Size - 1 byte on the last page).',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Address Translation: CPU generates logical address (p, d). Hardware checks TLB for page p. If TLB Hit: frame f is retrieved in 1 memory cycle. If TLB Miss: page table in RAM is accessed to find f, and TLB is updated.',
      },
      {
        category: 'How It Works / Mechanism',
        point: 'Page Fault Handling: If valid-invalid bit in page table is 0 (page not in RAM): 1. Trap to OS. 2. Save registers. 3. Locate victim page if frames full (Page Replacement). 4. Issue disk I/O to fetch page. 5. Update page table and restart CPU instruction.',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Effective Memory Access Time (EMAT): EMAT = Hit_Ratio * (TLB_access + Memory_access) + (1 - Hit_Ratio) * (TLB_access + 2 * Memory_access).',
      },
      {
        category: 'Formulas, Invariants & Complexity',
        point: 'Page Table Size Formula: Number of Entries = (Logical Address Space) / (Page Size). Total Size = (Number of Entries) * (Entry Size).',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Exam Trap: Page size must strictly be a power of 2 (e.g., 4 KB = 2^12 bytes, so offset d requires exactly 12 bits).',
      },
      {
        category: 'Exam Pointers & Traps',
        point: 'Thrashing: Occurs when the sum of working set sizes of all processes exceeds physical RAM capacity, causing CPU to spend 99% of its time swapping pages rather than executing instructions.',
      },
    ],
    questions: [
      {
        marks: '2 Marks',
        question: 'Differentiate between internal and external fragmentation in paging.',
        answer: 'Paging completely avoids external fragmentation because any free frame can be allocated to any process. However, internal fragmentation occurs within the final page of a process if its total allocated memory is not an exact multiple of the page size.',
      },
      {
        marks: '5 Marks',
        question: 'Calculate the Effective Memory Access Time (EMAT) if TLB search time is 10 ns, main memory access is 100 ns, and TLB hit ratio is 90%.',
        answer: 'EMAT = Hit_Ratio * (t_tlb + t_mem) + (1 - Hit_Ratio) * (t_tlb + 2 * t_mem). EMAT = 0.90 * (10 + 100) + 0.10 * (10 + 200) = 0.90 * 110 + 0.10 * 210 = 99 + 21 = 120 ns.',
      },
      {
        marks: '10 Marks',
        question: 'Describe the complete step-by-step procedure followed by the OS and hardware when a Page Fault occurs.',
        answer: '1. CPU references page whose valid bit is 0 in Page Table. 2. Hardware raises page fault interrupt (trap) to OS. 3. OS saves process state/registers. 4. Verify reference is legal (check backing store address). 5. Locate a free frame in physical RAM (if none free, apply page replacement algorithm like LRU to evict a dirty page). 6. Issue disk read I/O. 7. Update page table with frame number and valid bit = 1. 8. Restore process context and restart instruction.',
      },
      {
        marks: 'Viva / Interview',
        question: 'What is Inverted Page Table and why is it used in 64-bit architectures?',
        answer: 'Traditional page tables grow prohibitively large in 64-bit systems. An Inverted Page Table has only one entry per physical memory frame (rather than per virtual page), dramatically reducing memory overhead to O(Physical RAM) regardless of virtual address space.',
      },
    ],
    subjectId: 'sub-2',
    tags: ['OS', 'Paging', 'Virtual Memory', 'TLB', 'EMAT', 'Midsem Prep'],
  },
};

/**
 * Normalizes user topic search query to match curated topics
 */
function findCuratedTopic(query: string) {
  const q = query.toLowerCase().trim();
  if (q.includes('banker') || q.includes('deadlock avoidance') || q.includes('safe state')) {
    return TOPIC_KNOWLEDGE_BASE.banker;
  }
  if (q.includes('bcnf') || q.includes('boyce') || q.includes('normal form') || q.includes('normalization')) {
    return TOPIC_KNOWLEDGE_BASE.bcnf;
  }
  if (q.includes('tcp') || q.includes('handshake') || q.includes('flow control') || q.includes('congestion')) {
    return TOPIC_KNOWLEDGE_BASE.tcp;
  }
  if (q.includes('dijkstra') || q.includes('shortest path') || q.includes('relaxation')) {
    return TOPIC_KNOWLEDGE_BASE.dijkstra;
  }
  if (q.includes('page') || q.includes('paging') || q.includes('virtual memory') || q.includes('tlb') || q.includes('thrashing')) {
    return TOPIC_KNOWLEDGE_BASE.paging;
  }
  return null;
}

/**
 * Universal synthesis engine that generates notebook-ready bullet points + expected questions
 * for any computer science topic or pasted notes entered by the student.
 */
export function generateOfflineNotebookNotes(
  topic: string,
  subjectName?: string,
  rawContent?: string
): GeneratedNotebookNote {
  const cleanTitle = (topic && topic.trim()) || 'Pasted Revision Notes';

  // If student pasted their current notes / lecture text, synthesize directly from that content!
  if (rawContent && rawContent.trim().length > 20) {
    const text = rawContent.trim();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Extract sentences for summary
    const allSentences = text
      .replace(/\n+/g, ' ')
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const summary =
      allSentences.slice(0, 2).join(' ') ||
      `${cleanTitle} covers foundational principles in ${subjectName || 'Computer Science'}. These notes provide the definitions, working rules, and architectural trade-offs essential for examination mastery.`;

    // Extract bullet points from lines or sentences
    const extractedPoints: NotebookPoint[] = [];
    let ptId = 1;

    // Process explicit lines or bullet lines
    for (const line of lines) {
      // Remove leading bullet markers like -, *, 1., •
      const cleanLine = line.replace(/^([*\-•]|\d+[.)])\s*/, '').trim();
      if (cleanLine.length < 15) continue;

      const lower = cleanLine.toLowerCase();
      let category = 'Key Concept & Definition';

      if (
        lower.includes('formula') ||
        lower.includes('complexity') ||
        lower.includes('o(') ||
        lower.includes('theta(') ||
        lower.includes('omega(') ||
        lower.includes('invariant') ||
        lower.includes('=') ||
        lower.includes('<=') ||
        lower.includes('>=')
      ) {
        category = 'Formulas, Invariants & Complexity';
      } else if (
        lower.includes('step') ||
        lower.includes('algorithm') ||
        lower.includes('working') ||
        lower.includes('mechanism') ||
        lower.includes('phase') ||
        lower.includes('execute') ||
        lower.includes('flow')
      ) {
        category = 'How It Works / Mechanism';
      } else if (
        lower.includes('exam') ||
        lower.includes('trap') ||
        lower.includes('pitfall') ||
        lower.includes('important') ||
        lower.includes('note:') ||
        lower.includes('remember') ||
        lower.includes('advantage') ||
        lower.includes('disadvantage') ||
        lower.includes('drawback') ||
        lower.includes('limitation')
      ) {
        category = 'Exam Pointers & Traps';
      }

      extractedPoints.push({
        id: `pt-${ptId++}`,
        category,
        point: cleanLine,
        done: false, // "like if its done then tick it else no need"
      });

      if (extractedPoints.length >= 10) break;
    }

    // If extracted fewer than 5 points, supplement with sentence chunks
    if (extractedPoints.length < 5 && allSentences.length > 2) {
      allSentences.slice(2, 7).forEach((sentence) => {
        extractedPoints.push({
          id: `pt-${ptId++}`,
          category: 'Key Concept & Definition',
          point: sentence,
          done: false,
        });
      });
    }

    // Always ensure at least 6 points
    while (extractedPoints.length < 6) {
      extractedPoints.push({
        id: `pt-${ptId++}`,
        category: extractedPoints.length % 2 === 0 ? 'How It Works / Mechanism' : 'Exam Pointers & Traps',
        point: `Key takeaway: Ensure you review the prerequisites, input edge cases, and postconditions of ${cleanTitle} before writing the exam.`,
        done: false,
      });
    }

    const expectedQuestions: ExpectedQuestion[] = [
      {
        id: 'q-1',
        marks: '2 Marks',
        question: `Define the primary concept of ${cleanTitle} based on the notes and state its significance.`,
        answer: allSentences[0] || `${cleanTitle} provides structural mechanisms ensuring correctness and predictable execution in system workflows.`,
        done: false,
      },
      {
        id: 'q-2',
        marks: '5 Marks',
        question: `Explain the step-by-step working or mechanism of ${cleanTitle} described in your lecture notes.`,
        answer: allSentences.slice(1, 3).join(' ') || `Walk through the initialization state, transformation stages, and output verification with clear diagrammatic representations.`,
        done: false,
      },
      {
        id: 'q-3',
        marks: '10 Marks',
        question: `Write a comprehensive analysis of ${cleanTitle}, including its algorithmic steps, formal properties, and practical complexities.`,
        answer: `Structure the answer into 4 sections: 1. Formal Definition & Need, 2. Step-by-Step Working Mechanism with Equations, 3. Invariants & Proof of Correctness, 4. Asymptotic Time & Space Analysis.`,
        done: false,
      },
      {
        id: 'q-4',
        marks: 'Viva / Interview',
        question: `What is the most critical trade-off or potential drawback associated with ${cleanTitle}?`,
        answer: `Highlight trade-offs such as computational overhead, memory requirements, or assumptions that may not strictly hold in distributed production environments.`,
        done: false,
      },
    ];

    return {
      title: cleanTitle,
      summary,
      points: extractedPoints,
      expectedQuestions,
      subjectId: 'sub-1',
      tags: [cleanTitle, 'Pasted Notes', 'Notebook Ready'],
    };
  }

  // Otherwise check curated topics
  const curated = findCuratedTopic(topic);

  if (curated) {
    return {
      title: cleanTitle,
      summary: curated.summary,
      points: curated.points.map((p, idx) => ({
        id: `pt-${idx + 1}`,
        category: p.category,
        point: p.point,
        done: false, // Unticked by default: "like if its done then tick it else no need"
      })),
      expectedQuestions: curated.questions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        marks: q.marks,
        question: q.question,
        answer: q.answer,
        done: false, // Unticked by default
      })),
      subjectId: curated.subjectId,
      tags: curated.tags,
    };
  }

  // Dynamic universal synthesis for custom topics
  const summary = `${cleanTitle} is a foundational concept in ${subjectName || 'Computer Science'}. It provides the theoretical principles, algorithmic rules, and runtime guarantees necessary for optimal computational efficiency and system correctness.`;

  const points: NotebookPoint[] = [
    {
      id: 'pt-1',
      category: 'Key Concept & Definition',
      point: `Core Definition: ${cleanTitle} defines the fundamental properties, state variables, and operational boundaries of the system.`,
      done: false,
    },
    {
      id: 'pt-2',
      category: 'Key Concept & Definition',
      point: `Primary Objective: Designed to minimize overhead, enforce determinism, and prevent invalid or unhandled edge cases in execution.`,
      done: false,
    },
    {
      id: 'pt-3',
      category: 'How It Works / Mechanism',
      point: `Step 1 (Initialization): Declare data structures, establish precondition checks, and initialize tracking state before executing core logic.`,
      done: false,
    },
    {
      id: 'pt-4',
      category: 'How It Works / Mechanism',
      point: `Step 2 (Execution Phase): Process inputs sequentially or concurrently, maintaining invariant conditions across every state transition.`,
      done: false,
    },
    {
      id: 'pt-5',
      category: 'How It Works / Mechanism',
      point: `Step 3 (Termination & Output): Validate postconditions, free temporary allocated resources, and return deterministic results.`,
      done: false,
    },
    {
      id: 'pt-6',
      category: 'Formulas, Invariants & Complexity',
      point: `Time & Space Bounds: Analyze best-case, average-case, and worst-case complexities (e.g. logarithmic, polynomial, or linear bounds) based on input size N.`,
      done: false,
    },
    {
      id: 'pt-7',
      category: 'Formulas, Invariants & Complexity',
      point: `Mathematical Invariant: Verify that loop invariants and safety conditions hold true before, during, and after each computation cycle.`,
      done: false,
    },
    {
      id: 'pt-8',
      category: 'Exam Pointers & Traps',
      point: `High-Yield Exam Point: In university written exams, always state the base case, draw clean block/state diagrams, and explicitly define edge conditions.`,
      done: false,
    },
    {
      id: 'pt-9',
      category: 'Exam Pointers & Traps',
      point: `Common Exam Trap: Avoid confusing theoretical guarantees with physical hardware constraints; always mention worst-case behavior.`,
      done: false,
    },
  ];

  const expectedQuestions: ExpectedQuestion[] = [
    {
      id: 'q-1',
      marks: '2 Marks',
      question: `Define ${cleanTitle} and state its primary use case in engineering.`,
      answer: `${cleanTitle} is defined as a systematic mechanism designed to guarantee correctness and efficiency. Its primary use case is providing robust, scalable solutions under strict resource constraints.`,
      done: false,
    },
    {
      id: 'q-2',
      marks: '5 Marks',
      question: `Explain the step-by-step working mechanism of ${cleanTitle} with an illustrative diagram or walkthrough.`,
      answer: `Explain the 3 primary stages: initialization, iterative processing with invariant checks, and termination/cleanup. Highlight how boundary conditions are safely handled.`,
      done: false,
    },
    {
      id: 'q-3',
      marks: '10 Marks',
      question: `Discuss the design trade-offs, formal mathematical properties, and time/space complexity bounds of ${cleanTitle}.`,
      answer: `Provide a comprehensive breakdown covering: 1. Theoretical foundation, 2. Step-by-step algorithm pseudocode, 3. Mathematical proof of correctness, and 4. Asymptotic time and space complexity analysis.`,
      done: false,
    },
    {
      id: 'q-4',
      marks: 'Viva / Interview',
      question: `What are the most common failure modes or limitations of ${cleanTitle} in production environments?`,
      answer: `Discuss practical bottlenecks such as memory footprint, lock contention, scale limitations, or worst-case degradation when assumptions about input distributions fail.`,
      done: false,
    },
  ];

  return {
    title: cleanTitle,
    summary,
    points,
    expectedQuestions,
    subjectId: 'sub-1',
    tags: [cleanTitle, 'CSE Notes', 'Exam Prep'],
  };
}

/**
 * Fetch notes from server-side Gemini API (/api/generate-notes), falling back gracefully to local engine
 */
export async function fetchTopicNotes(
  topic: string,
  subjectName?: string,
  rawContent?: string
): Promise<GeneratedNotebookNote> {
  try {
    const res = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, subjectName, content: rawContent }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data && result.data.summary && Array.isArray(result.data.points)) {
        const raw = result.data;
        return {
          title: raw.title || topic,
          summary: raw.summary,
          points: raw.points.map((p: any, idx: number) => ({
            id: p.id || `pt-${idx + 1}`,
            category: p.category || 'Key Point',
            point: p.point || p.text || String(p),
            done: false, // Unticked by default: "like if its done then tick it else no need"
          })),
          expectedQuestions: Array.isArray(raw.expectedQuestions)
            ? raw.expectedQuestions.map((q: any, idx: number) => ({
                id: q.id || `q-${idx + 1}`,
                marks: q.marks || 'Exam Question',
                question: q.question,
                answer: q.answer,
                done: false, // Unticked by default
              }))
            : [],
          subjectId: 'sub-1',
          tags: [topic || 'Notes', 'Gemini AI', 'Notebook Ready'],
        };
      }
    }
  } catch (err) {
    console.warn('Server Gemini call failed, using local academic knowledge base:', err);
  }

  // Graceful fallback to rich local knowledge base
  return generateOfflineNotebookNotes(topic, subjectName, rawContent);
}
