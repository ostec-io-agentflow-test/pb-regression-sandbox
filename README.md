# pb-regression-sandbox

A small throwaway todo API. The Power Builder end-to-end regression ([APB-2729](https://agentflow-powerbuilder.atlassian.net/browse/APB-2729)) uses it to:
- import it,
- turn its issues into requests,
- build against it.

Agents push branches here, and each regression run resets it. **Do not depend on anything in this repo.**

```
npm test     # node --test, no dependencies
npm start    # http://localhost:3000/todos
```
