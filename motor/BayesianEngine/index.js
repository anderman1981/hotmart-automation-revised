class BayesianEngine {
    constructor() {
        console.log('🧮 Bayesian Engine: Initialized');
    }

    /**
     * Calculates a score based on a Beta Distribution expectation
     * Beta(alpha, beta) where alpha = successes + 1, beta = failures + 1
     * @param {number} successes - Positive signals (sales, high engagement)
     * @param {number} trials - Total opportunities (views, clicks)
     * @returns {number} - Mean probability score (0 to 100)
     */
    calculateScore(successes, trials) {
        // Laplace smoothing (add 1 to alpha and beta)
        const alpha = successes + 1;
        const beta = (trials - successes) + 1;
        
        // Mean of Beta distribution = alpha / (alpha + beta)
        const meanProbability = alpha / (alpha + beta);
        
        // Scale to 0-100
        return parseFloat((meanProbability * 100).toFixed(2));
    }

    /**
     * Decides the product status based on performance metrics
     * @param {object} metrics - { sales, clicks, socialEngagement, refundCount }
     * @param {number} daysActive - How long the product has been tracked
     * @returns {string} - 'active', 'scaling', 'paused', 'killed'
     */
    decideStatus(metrics, daysActive) {
        const { sales, clicks, refundCount } = metrics;
        
        // Kill switch: High refunds
        if (refundCount > 5 || (sales > 0 && refundCount / sales > 0.2)) {
            return 'killed';
        }

        // Assessment
        if (sales > 10 && clicks > 50) {
            return 'scaling'; // High performance
        }
        
        if (sales > 0) {
            return 'active'; // Has potential
        }

        if (daysActive > 7 && sales === 0) {
            return 'paused'; // Failed test
        }

        return 'testing'; // Default initial state
    }
}

export default new BayesianEngine();
