import { QuizQuestion, UniNote } from '../types';

// Curated question bank for key Indian CSE Core Curriculum topics
const CURATED_CSE_QUESTIONS: Record<string, QuizQuestion[]> = {
  os: [
    {
      id: 'os-1',
      question: 'Which of the following is NOT one of Coffman’s four necessary conditions for deadlock in an Operating System?',
      options: [
        'Mutual Exclusion',
        'Hold and Wait',
        'Preemption permitted by OS',
        'Circular Wait',
      ],
      correctIndex: 2,
      explanation: 'No preemption (resources cannot be forcibly taken away) is the necessary condition. If preemption is permitted, deadlocks can be broken!',
      topic: 'Deadlocks',
    },
    {
      id: 'os-2',
      question: 'What is the main purpose of the Banker’s Algorithm in operating systems?',
      options: [
        'Deadlock detection and termination',
        'Deadlock avoidance by checking system safe states',
        'Memory allocation using virtual paging',
        'CPU burst scheduling optimization',
      ],
      correctIndex: 1,
      explanation: 'The Banker’s Algorithm avoids deadlocks by simulating allocation of predetermined maximum possible amounts of all resources and checking for a safe state sequence.',
      topic: 'Banker’s Algorithm',
    },
    {
      id: 'os-3',
      question: 'In paging memory management, what phenomenon occurs when the working set of pages cannot fit into physical RAM, causing continuous page faults?',
      options: [
        'Internal Fragmentation',
        'External Fragmentation',
        'Thrashing',
        'Belady’s Anomaly',
      ],
      correctIndex: 2,
      explanation: 'Thrashing occurs when the system spends more time servicing page faults and swapping pages than executing actual instructions.',
      topic: 'Virtual Memory',
    },
    {
      id: 'os-4',
      question: 'Which CPU scheduling algorithm is mathematically proven to achieve the minimum average waiting time for a given set of processes?',
      options: [
        'First-Come First-Served (FCFS)',
        'Round Robin (RR)',
        'Shortest Job First (SJF) / Shortest Remaining Time First',
        'Priority Scheduling with aging',
      ],
      correctIndex: 2,
      explanation: 'Shortest Job First (SJF) is provably optimal in minimizing average waiting time for a given set of stationary processes.',
      topic: 'CPU Scheduling',
    },
    {
      id: 'os-5',
      question: 'What happens when a binary semaphore’s wait() / P operation is called when its value is 0?',
      options: [
        'The process increments the counter and enters critical section',
        'The process is blocked / placed on the semaphore’s waiting queue',
        'The operating system immediately triggers a kernel panic',
        'The semaphore value wraps around to 255',
      ],
      correctIndex: 1,
      explanation: 'Calling wait()/P() on a semaphore with value 0 causes the executing process to sleep and block until another process invokes signal()/V().',
      topic: 'Concurrency & Semaphores',
    },
  ],
  dbms: [
    {
      id: 'db-1',
      question: 'A relational table is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial Functional Dependency X -> Y:',
      options: [
        'Y is a prime attribute',
        'X is a superkey of the relation',
        'X is a foreign key referencing another table',
        'Y is functionally dependent on the primary key',
      ],
      correctIndex: 1,
      explanation: 'BCNF is a stricter version of 3NF where for every functional dependency X -> Y, the determinant X must strictly be a Superkey.',
      topic: 'Normalization',
    },
    {
      id: 'db-2',
      question: 'Which ACID property guarantees that all operations within a database transaction complete successfully, or all changes are rolled back completely?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctIndex: 0,
      explanation: 'Atomicity ensures "all-or-nothing" execution. If a failure occurs mid-transaction, all previous writes are reverted.',
      topic: 'Transactions & ACID',
    },
    {
      id: 'db-3',
      question: 'Why are B+ Trees predominantly preferred over standard Binary Search Trees or B-Trees for database disk indexing?',
      options: [
        'B+ Trees store all actual record pointers strictly in leaf nodes, maximizing leaf fanout and enabling fast sequential range scans',
        'B+ Trees have O(1) worst-case search complexity',
        'B+ Trees do not require rebalancing during insertions',
        'B+ Trees use less memory than hash indexes',
      ],
      correctIndex: 0,
      explanation: 'B+ trees keep internal nodes small (holding only routing keys), fitting hundreds of keys per disk page block, while linked leaf nodes make range scans extremely fast.',
      topic: 'Indexing & B+ Trees',
    },
    {
      id: 'db-4',
      question: 'In SQL, what is the key difference between WHERE and HAVING clauses?',
      options: [
        'WHERE filters rows after aggregation; HAVING filters rows before aggregation',
        'WHERE filters individual rows before aggregation; HAVING filters aggregated groups created by GROUP BY',
        'HAVING can only be used with JOIN queries',
        'WHERE requires an index whereas HAVING does not',
      ],
      correctIndex: 1,
      explanation: 'WHERE filters rows prior to grouping; HAVING applies predicate filters to grouped rows after GROUP BY evaluates aggregate functions.',
      topic: 'SQL Queries',
    },
  ],
  dsa: [
    {
      id: 'dsa-1',
      question: 'What is the worst-case time complexity of searching an element in a balanced AVL Tree with N elements?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctIndex: 1,
      explanation: 'Because AVL trees enforce a strict balance factor difference of at most 1 between left and right subtrees, the tree height is guaranteed O(log N), making search O(log N).',
      topic: 'Balanced Trees',
    },
    {
      id: 'dsa-2',
      question: 'Dijkstra’s algorithm for Single-Source Shortest Path fails or produces incorrect results when graph edges contain:',
      options: [
        'Directed cycles',
        'Negative weight cycles or negative edge weights',
        'Multiple components',
        'Unweighted undirected edges',
      ],
      correctIndex: 1,
      explanation: 'Dijkstra relies on greedy monotonic distance updates. Negative edge weights can lower already finalized vertex distances, breaking the greedy invariant. Bellman-Ford should be used instead.',
      topic: 'Graph Algorithms',
    },
    {
      id: 'dsa-3',
      question: 'Which algorithmic paradigm does Kruskal’s Minimum Spanning Tree algorithm employ?',
      options: [
        'Dynamic Programming with Memoization',
        'Greedy Algorithm utilizing Disjoint Set Union (DSU / Union-Find)',
        'Backtracking with Branch and Bound',
        'Divide and Conquer',
      ],
      correctIndex: 1,
      explanation: 'Kruskal sorts all edges greedily by weight and uses Union-Find (Disjoint Set Union) with path compression to detect cycles in near O(E log E) time.',
      topic: 'Minimum Spanning Trees',
    },
    {
      id: 'dsa-4',
      question: 'What is the recurrence relation for the standard Merge Sort algorithm?',
      options: [
        'T(N) = T(N/2) + O(1)',
        'T(N) = 2T(N/2) + O(N)',
        'T(N) = T(N-1) + O(N)',
        'T(N) = 2T(N/2) + O(1)',
      ],
      correctIndex: 1,
      explanation: 'Merge sort divides the array into 2 halves (2T(N/2)) and merges the sorted halves in linear O(N) time. By the Master Theorem, this yields O(N log N).',
      topic: 'Divide & Conquer',
    },
  ],
  cn: [
    {
      id: 'cn-1',
      question: 'How many packets are exchanged in the standard TCP connection establishment handshake?',
      options: ['2 packets (SYN, ACK)', '3 packets (SYN, SYN-ACK, ACK)', '4 packets (SYN, ACK, FIN, ACK)', '1 packet'],
      correctIndex: 1,
      explanation: 'TCP 3-Way Handshake consists of SYN (Client to Server) -> SYN-ACK (Server to Client) -> ACK (Client to Server) before reliable data transmission begins.',
      topic: 'Transport Layer',
    },
    {
      id: 'cn-2',
      question: 'Which layer of the OSI model is responsible for logical IP addressing, routing, and packet forwarding across networks?',
      options: ['Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'],
      correctIndex: 1,
      explanation: 'Network Layer (Layer 3) handles IP addressing, routing protocols (OSPF, BGP), and packet forwarding across subnetworks.',
      topic: 'OSI Model',
    },
    {
      id: 'cn-3',
      question: 'What mechanism does TCP use to avoid congesting the network pipe when transferring large streams of data?',
      options: [
        'Slow Start, Congestion Avoidance, Fast Retransmit & Fast Recovery (AIMD)',
        'Round Robin token bucket swapping',
        'CSMA/CD collision detection',
        'Distance Vector routing updates',
      ],
      correctIndex: 0,
      explanation: 'TCP uses Slow Start (exponential window growth), AIMD (Additive Increase Multiplicative Decrease), and Fast Recovery upon packet drops.',
      topic: 'TCP Congestion Control',
    },
  ],
};

/**
 * Parses user notes to dynamically synthesize questions,
 * combining keywords, bullet points, definitions, and curated CSE standards.
 */
export function generateQuizFromNote(note: UniNote): QuizQuestion[] {
  const text = (note.title + ' ' + note.content).toLowerCase();
  let selectedCategory = 'os';

  if (text.includes('database') || text.includes('dbms') || text.includes('sql') || text.includes('normalization') || text.includes('acid')) {
    selectedCategory = 'dbms';
  } else if (text.includes('tree') || text.includes('graph') || text.includes('dijkstra') || text.includes('dsa') || text.includes('algorithm') || text.includes('sort')) {
    selectedCategory = 'dsa';
  } else if (text.includes('network') || text.includes('tcp') || text.includes('ip') || text.includes('osi') || text.includes('packet')) {
    selectedCategory = 'cn';
  } else {
    selectedCategory = 'os';
  }

  const baseQuestions = [...(CURATED_CSE_QUESTIONS[selectedCategory] || CURATED_CSE_QUESTIONS.os)];

  // If note has distinct lines or terms, extract dynamic questions
  const lines = note.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && (l.includes(':') || l.includes('-') || l.includes('=')));

  if (lines.length > 0) {
    const sampleLine = lines[0];
    const parts = sampleLine.split(/[:\-]/);
    if (parts.length >= 2 && parts[0].trim().length > 3) {
      const term = parts[0].trim();
      const def = parts.slice(1).join('-').trim();

      const dynamicQ: QuizQuestion = {
        id: `dyn-${Date.now()}`,
        question: `According to your lecture note on "${note.title}", what accurately defines "${term}"?`,
        options: [
          def,
          `An auxiliary compiler routine that executes prior to link-time optimization`,
          `A legacy protocol deprecated in modern IEEE and POSIX standards`,
          `A probabilistic data structure used exclusively for hash collisions`,
        ],
        correctIndex: 0,
        explanation: `Directly extracted from your note: "${sampleLine}"`,
        topic: note.unitOrModule || 'Lecture Note Key Concept',
      };
      baseQuestions.unshift(dynamicQ);
    }
  }

  return baseQuestions.slice(0, 5);
}
