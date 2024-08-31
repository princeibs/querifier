# QuerifyAI 

QuerifyAI simplifies the complexities involved in querying and understanding the blockchain data. It makes interacting with blockchain data as easy as chatting with an AI. 

1. Index the blockchain data using The Graph
2. Accept input query from the user
3. Generate the corresponding GraphQL query using LLM such as OpenAI
4. Send the generated GraphQL query to the API endpoint provided by The Graph and receive the result of the query
5. Send the result to LLM such as OpenAI to translate the result in human readable format and receive the output message from the LLM.
6. Display the output message to the user in human readable format

## Tech 
- ReactJS(Vite) (For user interface)
- OpenAI API (for LLM)
- The Graph (for querying and indexing blockchain data)

## Development
Follow the steps below to build and run locally
1. Install packages
```bash
pnpm install
```
2. Set environment variables
> Create a file named `.env` in the root directory and add the following:
```bash
VITE_OPENAI_API_KEY=**** // Replace with your OpenAI API key
```
Get your OpenAI API key at: https://platform.openai.com/account/api-keys
3. Run QuerifyAI
```bash
pnpm run dev
```