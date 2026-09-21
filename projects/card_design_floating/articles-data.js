/**
 * EXITO 3D PUBLISHING UNIVERSE - ARTICLE DATA LAYER (MOCK STORE)
 * Decoupled Data Model ready for future API integration (Article[] schema)
 */

export const CATEGORIES = [
  'All',
  'AI & Neural',
  'Quantum Computing',
  'Space Tech',
  'Fintech & Web3',
  'Design & Spatial',
  'Cybernetics'
];

export const ARTICLES = [
  {
    id: 'art-01',
    slug: 'neural-mesh-cognitive-computing',
    title: 'Neural Mesh: The Architecture of Distributed Cognitive Engines',
    excerpt: 'How self-organizing synthetic synapses enable microsecond reasoning without central orchestration.',
    category: 'AI & Neural',
    author: 'Dr. Alistair Vance',
    authorRole: 'Head of Cognitive Systems',
    publishedAt: 'Sep 21, 2026',
    readingTime: '6 min read',
    tags: ['Neural', 'Synapses', 'Distributed AI'],
    status: 'Featured',
    badge: 'DEEP DIVE',
    glowColor: 'rgba(0, 243, 255, 0.75)',
    modelType: 'ai-sphere',
    content: `
# Neural Mesh: The Architecture of Distributed Cognitive Engines

In the dawn of planetary-scale computing, traditional centralized transformers encounter insurmountable latency and thermodynamic barriers. The **Neural Mesh** paradigm replaces bulky server clusters with decentralized, self-optimizing neuromorphic nodes.

---

## 1. The Breakdown of Monolithic Models

Modern artificial intelligence demands more than brute-force matrix multiplication. Real-time sensory synthesis requires localized reasoning units that mimic human cortical columns:

* **Micro-Synaptic Latency:** Sub-millisecond decision loops occurring at edge sensors.
* **Energy Pruning:** Zero idle power consumption through event-driven spiking neural networks.
* **Autonomous Consensus:** Nodes synchronize high-level intuitions via cryptographic semantic proofs rather than raw weight broadcasting.

> *"Intelligence in the 21st century is not measured by parameter count, but by the velocity of adaptation."*

---

## 2. Mathematical Formalism of Dynamic Rewiring

Consider a mesh graph $G = (V, E)$ where vertices represent cognitive micro-clusters and edges represent adaptive bandwidth channels. The conductance $W_{ij}(t)$ evolves according to generalized plasticity:

\`\`\`python
# Dynamic Synaptic Plasticity Simulation
import numpy as np

def update_synaptic_conductance(w_prev, pre_spike, post_spike, tau=20.0):
    dt = post_spike - pre_spike
    if dt > 0:
        delta_w = np.exp(-dt / tau) * 0.05
    else:
        delta_w = -np.exp(dt / tau) * 0.025
    return np.clip(w_prev + delta_w, 0.0, 1.0)
\`\`\`

---

## 3. Spatial Coherence & Zero-Lag Inference

By leveraging optical interconnects and phase-change memory, Neural Mesh systems achieve continuous inference streams without cache thrashing. The result is a post-digital intelligence ecosystem capable of evolving in direct harmony with user queries.
    `
  },
  {
    id: 'art-02',
    slug: 'quantum-annealing-financial-arbitrage',
    title: 'Quantum Advantage: Topological Coherence in Global Markets',
    excerpt: 'Harnessing room-temperature topological qubits to solve multi-asset liquidity arbitrage in sub-nanoseconds.',
    category: 'Quantum Computing',
    author: 'Elena Rostova',
    authorRole: 'Principal Quantum Physicist',
    publishedAt: 'Sep 19, 2026',
    readingTime: '8 min read',
    tags: ['Quantum', 'Topological', 'Arbitrage'],
    status: 'Trending',
    badge: 'BREAKTHROUGH',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    modelType: 'quantum',
    content: `
# Quantum Advantage: Topological Coherence in Global Markets

High-frequency algorithmic trading has reached the physical speed limit of light through optical fiber. The next paradigm shift does not seek faster transit, but simultaneous state exploration through topological quantum annealing.

---

## 1. Beyond Classical Order Books

When market volatility spikes, multi-asset routing becomes an NP-hard quadratic unconstrained binary optimization (QUBO) problem. Classical supercomputers choke on combinatorial explosions:

1. **Simultaneous Traversal:** Superposition evaluates billions of cross-currency arbitrage routes simultaneously.
2. **Majorana Zero Modes:** Braided non-Abelian anyons protect quantum information from thermodynamic noise without cryogenic dilution.

> *"Where classical processors see a sequential maze of prices, quantum coherence sees a single harmonic surface."*

---

## 2. Topological Hamiltonian Formulation

\`\`\`rust
// Quantum Annealing Formulation for Liquidity Routing
pub fn compute_hamiltonian(assets: &[Asset], coupling_matrix: &[f64]) -> f64 {
    let mut energy = 0.0;
    for i in 0..assets.len() {
        for j in (i + 1)..assets.len() {
            energy += coupling_matrix[i * assets.len() + j] * assets[i].spin * assets[j].spin;
        }
    }
    energy
}
\`\`\`

---

## 3. The Future of Zero-Slippage Execution

By deploying topological quantum processors directly at financial gateway centers, slippage and predatory front-running become relics of obsolete computational architecture.
    `
  },
  {
    id: 'art-03',
    slug: 'deep-space-orbital-foundries',
    title: 'Orbital Foundries: Zero-G Material Synthesis and Superalloys',
    excerpt: 'Manufacturing flawless crystalline semiconductors and exotic metamaterials beyond Earth’s gravitational well.',
    category: 'Space Tech',
    author: 'Commander Kenji Sato',
    authorRole: 'Orbital Logistics Director',
    publishedAt: 'Sep 15, 2026',
    readingTime: '5 min read',
    tags: ['Space', 'Materials', 'Zero-G'],
    status: 'Popular',
    badge: 'INDUSTRIAL',
    glowColor: 'rgba(236, 72, 153, 0.75)',
    modelType: 'pedestal',
    content: `
# Orbital Foundries: Zero-G Material Synthesis

Gravity is the silent enemy of crystalline purity. On Earth, thermal convection currents and buoyancy cause dislocations, grain boundaries, and chemical segregation in molten alloys.

---

## 1. The Microgravity Metallurgy Advantage

In Low Earth Orbit (LEO), fluids float in hydrostatic equilibrium without contact containers:

* **Containerless Levitation:** Acoustic and electromagnetic fields suspend molten droplets without wall contamination.
* **ZBLAN Fiber Optic Purity:** Glass optical fibers drawn in microgravity boast 100x lower attenuation than silica, unlocking transcontinental unamplified lightguides.
* **Monocrystalline Superconductors:** Layered atomic deposition occurs with zero sediment defects.

---

## 2. Autonomous Solar Smelting Architecture

Using giant parabolic mirrors to focus direct solar radiation, orbital foundries generate temperatures exceeding 3,000°C with zero carbon emissions and zero atmosphere oxidation.
    `
  },
  {
    id: 'art-04',
    slug: 'decentralized-autonomous-liquidity',
    title: 'Programmable Capital: Autonomous Liquidity Protocols at Scale',
    excerpt: 'Algorithmic market makers powered by dynamic bonding curves and zero-knowledge solvency verification.',
    category: 'Fintech & Web3',
    author: 'Marcus Sterling',
    authorRole: 'DeFi Systems Architect',
    publishedAt: 'Sep 12, 2026',
    readingTime: '6 min read',
    tags: ['Fintech', 'DeFi', 'Zero-Knowledge'],
    status: 'Featured',
    badge: 'PROTOCOL',
    glowColor: 'rgba(59, 130, 246, 0.75)',
    modelType: 'loop',
    content: `
# Programmable Capital: Autonomous Liquidity Protocols

The traditional banking architecture relies on trusted human intermediaries, batch reconciliation, and opaque balance sheets. Autonomous liquidity protocols introduce mathematical certainty into capital allocation.

---

## 1. Constant Function Market Curves

By unifying automated market maker formulas with dynamic risk premiums, protocols can withstand extreme volatility without impermanent loss:

\`\`\`solidity
// Simplified Autonomous Curve Invariant
function computeInvariant(uint256 x, uint256 y, uint256 alpha) internal pure returns (uint256) {
    return (x * y) + (alpha * (x + y));
}
\`\`\`

---

## 2. Real-Time Solvency via zk-SNARKs

No depositor needs to trust audit reports. Every state transition is cryptographically backed by zero-knowledge validity proofs verified directly by the consensus layer.
    `
  },
  {
    id: 'art-05',
    slug: 'spatial-computing-human-interface',
    title: 'Spatial Canvas: Beyond Glass Screens into Volumetric Workspace',
    excerpt: 'The transition from flat 2D viewports to lightfield displays, spatial anchors, and persistent ambient holography.',
    category: 'Design & Spatial',
    author: 'Aria Thorne',
    authorRole: 'Spatial Experience Director',
    publishedAt: 'Sep 10, 2026',
    readingTime: '5 min read',
    tags: ['Spatial UI', 'Volumetric', 'Three.js'],
    status: 'Editor’s Choice',
    badge: 'DESIGN',
    glowColor: 'rgba(99, 102, 241, 0.75)',
    modelType: 'tube',
    content: `
# Spatial Canvas: Beyond Glass Screens into Volumetric Workspaces

For four decades, human-computer interaction has been constrained to planar rectangles—desktop monitors, laptop lids, and phone glass. Spatial computing breaks these digital cages.

---

## 1. Principles of Spatial UI Ergonomics

Designing for volumetric depth requires abandoning flat layout paradigms:

* **Depth as Hierarchy:** Crucial interactive elements float near the user's convergence plane; ambient contextual cards rest in the periphery.
* **Gaze and Micro-Gesture:** Eye tracking replaces cursor travel; micro-pinches replace mouse clicks.
* **Physics-Anchored Persistence:** Windows maintain spatial permanence in the user's room architecture.
    `
  },
  {
    id: 'art-06',
    slug: 'synthetic-biology-cellular-factories',
    title: 'Living Silicon: Bio-Synthetic Computing and DNA Data Archives',
    excerpt: 'Encoding exabytes of digital information into synthesized nucleotide sequences with 10,000-year stability.',
    category: 'Cybernetics',
    author: 'Dr. Soraya Mir',
    authorRole: 'Molecular Biocomputing Lead',
    publishedAt: 'Sep 08, 2026',
    readingTime: '7 min read',
    tags: ['Bio-Tech', 'DNA Storage', 'Synthetic Biology'],
    status: 'Deep Research',
    badge: 'CYBER',
    glowColor: 'rgba(244, 114, 182, 0.75)',
    modelType: 'wave',
    content: `
# Living Silicon: Bio-Synthetic Computing and DNA Data Archives

All human digital storage produced in 2026—exabytes of video, scientific records, and software code—can fit into a spoonful of synthetic DNA weighing less than five grams.

---

## 1. The Immortality of Nucleotide Encoding

Magnetic tape degrades in decades; flash drives experience gate leakage in years. DNA recovered from ancient mammoth fossils remains legible after 1,000,000 years:

1. **4-Base Encoding:** A, C, G, T mapped to base-4 quaternary binary arrays ($00, 01, 10, 11$).
2. **Volumetric Density:** $10^{18}$ bytes per cubic millimeter.
3. **Biological Error Correction:** Reed-Solomon polynomial check-sums embedded in synthetic primers.
    `
  },
  {
    id: 'art-07',
    slug: 'post-quantum-cryptography-lattices',
    title: 'Lattice Cryptography: Fortifying Planetary Networks against Shor',
    excerpt: 'Implementing high-dimensional Learning With Errors (LWE) cryptosystems to survive quantum cryptanalysis.',
    category: 'Quantum Computing',
    author: 'Vikram Patel',
    authorRole: 'Cryptography Architect',
    publishedAt: 'Sep 05, 2026',
    readingTime: '6 min read',
    tags: ['Security', 'Cryptography', 'Lattice'],
    status: 'Essential',
    badge: 'SECURITY',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    modelType: 'quantum',
    content: `
# Lattice Cryptography: Fortifying Planetary Networks against Shor

When fault-tolerant quantum computers run Shor’s algorithm, RSA and Elliptic Curve cryptography will dissolve instantly. The global internet's defense relies on geometric lattice hardness.

---

## 1. The Shortest Vector Problem (SVP)

While quantum computers excel at finding periods in cyclic groups, they offer no exponential speedup against finding closest lattice vectors in 1,000-dimensional space:

\`\`\`c
// Module-LWE Key Encapsulation Primitive
int crypto_kem_enc(uint8_t *ciphertext, uint8_t *shared_secret, const uint8_t *public_key) {
    // Generate uniform error vector e from Gaussian distribution
    // Compute B = A*s + e (mod q)
    return 0; // Constant time execution
}
\`\`\`
    `
  },
  {
    id: 'art-08',
    slug: 'autonomous-swarm-robotics-planetary',
    title: 'Swarm Intelligence: Coordinated Planetary Surface Exploration',
    excerpt: 'Self-healing robotic swarms constructing extraterrestrial infrastructure without human intervention.',
    category: 'Space Tech',
    author: 'Dr. Chen Wei',
    authorRole: 'Autonomous Swarms Specialist',
    publishedAt: 'Sep 02, 2026',
    readingTime: '7 min read',
    tags: ['Robotics', 'Swarms', 'Autonomous'],
    status: 'Trending',
    badge: 'ROBOTICS',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    modelType: 'track',
    content: `
# Swarm Intelligence: Coordinated Planetary Surface Exploration

Deploying single multi-billion-dollar rovers to Mars is too risky and slow. The new doctrine deploys thousands of cooperative autonomous microrobots that behave like synthetic social insects.

---

## 1. Emergent Stigmergy

Robots communicate indirectly by modifying local terrain and leaving electronic spatial beacons:

* **Fault-Tolerant Loss:** If 30% of individual units fail, the collective swarm mission objectives remain 100% intact.
* **Collective Excavation:** Swarms work together like ant colonies to construct underground radiation-shielded lava tube habitats.
    `
  },
  {
    id: 'art-09',
    slug: 'neuro-prosthetics-direct-cortex-bus',
    title: 'Direct Cortex Bus: High-Bandwidth Neural Interfaces',
    excerpt: 'Biocompatible graphene ribbon arrays bridging optical silicon with human sensory and motor cortex.',
    category: 'Cybernetics',
    author: 'Dr. Maya Lin',
    authorRole: 'Neural Engineering Director',
    publishedAt: 'Aug 29, 2026',
    readingTime: '8 min read',
    tags: ['BCI', 'Neural Bus', 'Graphene'],
    status: 'Featured',
    badge: 'NEURO',
    glowColor: 'rgba(239, 68, 68, 0.75)',
    modelType: 'ai-sphere',
    content: `
# Direct Cortex Bus: High-Bandwidth Neural Interfaces

The ultimate communication bottleneck is human fingers typing on mechanical keyboards or tapping glass. High-density neural interfaces bypass physical peripherals entirely.

---

## 1. Sub-Cellular Graphene Electrodes

Traditional stiff silicon needles cause glial scarring and tissue degradation within months. Ultra-flexible graphene threads match the mechanical impedance of human brain tissue:

* **100,000 Channel Recording:** Monitoring individual action potentials across entire cortical layers simultaneously.
* **Closed-Loop Sensory Feedback:** Stimulating precise somatosensory columns to restore real physical touch sensation in robotic limbs.
    `
  }
];

/**
 * Filter articles by query string and category
 */
export function queryArticles(dataset, searchQuery = '', category = 'All') {
  return dataset.filter(art => {
    const matchCategory = category === 'All' || art.category === category;
    if (!matchCategory) return false;

    if (!searchQuery || searchQuery.trim() === '') return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.author.toLowerCase().includes(q) ||
      art.tags.some(t => t.toLowerCase().includes(q))
    );
  });
}
