class QLearner {
    constructor(actions) {
        this.actions = actions;
        this.qValues = new Map();
    }

    getActionName(number) {
        return this.actions[number];
    }

    stateActionPair(state, action) {
        return JSON.stringify({ state: state, action: action });
    }

    updateQValue(state, action, newValue) {
        let key = this.stateActionPair(state, action);
        this.qValues.set(key, newValue);
    }

    getQValue(state, action) {
        let key = this.stateActionPair(state, action);
        return this.qValues.get(key);
    }

    learn(state, action, reward, nextState) {
        // Q-learning update rule: Q(s, a) <- Q(s, a) + alpha * (reward + gamma * max Q(s', a') - Q(s, a))
        let currentQValue = this.getQValue(state, action) > Number.NEGATIVE_INFINITY ? this.getQValue(state, action) : PARAMS.defaultQValue;
        let maxNextQValue = this.policy(nextState).qValue > Number.NEGATIVE_INFINITY ? this.policy(nextState).qValue : PARAMS.defaultQValue;

        let newQValue = currentQValue + PARAMS.qLearningRate * (reward + PARAMS.qLearningDiscount * maxNextQValue - currentQValue);
        this.updateQValue(state, action, newQValue);
    }

    policy(state) {
        // Determine the policy based on the learned Q-values
        let bestAction = null;
        let maxQValue = Number.NEGATIVE_INFINITY;

        let indexArray = shuffleArray(numArray(this.actions.length));
        for (let i = 0; i < indexArray.length; i++) {
            let index = indexArray[i];
            let value = this.getQValue(state, index) > Number.NEGATIVE_INFINITY ? this.getQValue(state, index) : PARAMS.defaultQValue;
            if (value > maxQValue) {
                maxQValue = value;
                bestAction = index;
            }
        }

        return { action: bestAction, qValue: maxQValue };
    }
}
