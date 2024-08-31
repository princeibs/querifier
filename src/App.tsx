import { useState } from "react";
import { gql, request } from "graphql-request";

import TheGraphLogo from "./assets/thegraphlogo.png";
import { extractBracesContent, processMd } from "./utils";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  const [query, setQuery] = useState(
    "the first 6 addresses that made transfers throughout the month of january, 2021, the time they made the transfers, and the amount they transferred"
  );
  const [output, setOutput] = useState<any>("");
  const [checked, setchecked] = useState(false);
  const [generatingQuery, setGeneratingQuery] = useState(false);
  const [sendingQuery, setSendingQuery] = useState(false);

  const gqlSchema = `
  type Approval @entity(immutable: true) {
    id: Bytes!
    owner: Bytes! # address
    spender: Bytes! # address
    value: BigInt! # uint256
    blockNumber: BigInt!
    blockTimestamp: BigInt!
    transactionHash: Bytes!
  }
  
  type OwnershipTransferred @entity(immutable: true) {
    id: Bytes!
    previousOwner: Bytes! # address
    newOwner: Bytes! # address
    blockNumber: BigInt!
    blockTimestamp: BigInt!
    transactionHash: Bytes!
  }
  
  type Transfer @entity(immutable: true) {
    id: Bytes!
    from: Bytes! # address
    to: Bytes! # address
    value: BigInt! # uint256
    blockNumber: BigInt!
    blockTimestamp: BigInt!
    transactionHash: Bytes!
  }`;

  const url =
    "https://api.studio.thegraph.com/query/87097/usdt-ethereum/version/latest";
  async function fetchSubgraphData(query) {
    return await request(url, query);
  }

  const sendQuery = async (e) => {
    e.preventDefault();

    if (!checked) {
      alert(
        "Please check the box. Query cannot be outside the context of BSC USDT smart contract "
      );
      return;
    }

    const payload = {
      model: "gpt-4o-mini",
      // response_format: {
      //   type: "json_object",
      // },
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: `${gqlSchema} \n\n Using the graphql schema above, create a graphql query for the message: ${query}. return only the graphql query`,
        },
      ],
      temperature: 0,
    };

    try {
      setGeneratingQuery(true);
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + API_KEY,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          let output = data?.choices[0].message.content;
          let content = extractBracesContent(output);
          setOutput(content);

          let query = gql`
            ${content}
          `;

          setGeneratingQuery(false);
          setSendingQuery(true);

          fetchSubgraphData(query)
            .then((data) => {
              console.log("data: ", data);
              setOutput(JSON.stringify(data));
            })
            .catch(console.error);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setGeneratingQuery(false);
      setSendingQuery(false);
    }
  };

  return (
    <div className="bg-black w-full min-h-screen text-white pb-[200px]">
      <div className="h-10 w-full">
        <div className="flex flex-col pl-5 pt-5">
          <p className="text-4xl font-bold">
            Querify<span className="text-green-600">AI</span>
          </p>
          <p className="text-sm">Query blockchain data with AI</p>
        </div>
      </div>

      <h1 className="mb-4 mt-40 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl text-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 mr-2">
          Blockchain Data
        </span>
        Easily Accessible.
      </h1>
      <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 text-center">
        QuerifyAI makes querying the blockchain data as easy as chatting with an
        AI
      </p>
      <p className="italic text-center mt-8 flex items-center justify-center gap-1 text-green-500">
        Powered by <img width={"100px"} src={TheGraphLogo} />{" "}
      </p>

      <div className="w-full mt-24 flex flex-col justify-center items-center">
        <div className="w-[580px]">
          <label
            for="message"
            class="block mb-2 text-2xl font-medium text-gray-900 dark:text-white"
          >
            Enter your query
          </label>
        </div>
        <form className="w-[600px]" onSubmit={(e) => sendQuery(e)}>
          <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
              <label for="comment" className="sr-only">
                Your comment
              </label>
              <textarea
                id="comment"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows="4"
                className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400 outline-none"
                placeholder="How many USDT was transfered out of 0x1234 between August 1st and August 31 of 2024?"
                required
              ></textarea>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
              <button
                type="submit"
                disabled={generatingQuery || sendingQuery}
                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800   disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {!sendingQuery && !generatingQuery ? "Query" : ""}
                {!sendingQuery && generatingQuery ? "Generating Query" : ""}
                {sendingQuery && !generatingQuery ? "Sending Query" : ""}
              </button>
              <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
                <button
                  type="button"
                  className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 12 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"
                    />
                  </svg>
                  <span className="sr-only">Attach file</span>
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 20"
                  >
                    <path d="M8 0a7.992 7.992 0 0 0-6.583 12.535 1 1 0 0 0 .12.183l.12.146c.112.145.227.285.326.4l5.245 6.374a1 1 0 0 0 1.545-.003l5.092-6.205c.206-.222.4-.455.578-.7l.127-.155a.934.934 0 0 0 .122-.192A8.001 8.001 0 0 0 8 0Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  <span className="sr-only">Set location</span>
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                  <span className="sr-only">Upload image</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center ">
          <input
            id="link-checkbox"
            type="checkbox"
            value="selected"
            onChange={(e) => setchecked(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            for="link-checkbox"
            class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            I am querying within the context of
            <a
              href="https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955"
              className="text-blue-600 dark:text-blue-500 hover:underline"
            >
              BSC USDT Contract
            </a>
          </label>
        </div>

        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          QuerifyAI can only query data on
          <a
            href="https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955"
            className="text-blue-600 dark:text-blue-500 hover:underline ml-1"
          >
            BSC USDT Contract
          </a>
          at the moment .
        </p>
      </div>

      <div className="w-full mt-24 flex flex-col justify-center items-center">
        <div className="w-[580px]">
          <label
            for="message"
            class="block mb-2 text-2xl font-medium text-gray-900 dark:text-white"
          >
            Output
          </label>
        </div>
        <div
          id="message"
          rows="4"
          // value={processMd(output)}
          dangerouslySetInnerHTML={{ __html: processMd(output) }}
          className="w-[600px] block overflow-scroll p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          // placeholder="No comment..."
          disabled
        ></div>
      </div>
    </div>
  );
}

export default App;
