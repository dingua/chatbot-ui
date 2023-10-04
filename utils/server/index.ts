import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Result } from 'postcss';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

async function search_for_polaris_component(query: String) {
  // call POST API `localhost:8000/search` with `inputText` as body

  const response = await fetch(`http://localhost:8000/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputText: query,
    })
  });

  const responseJson = await response.json();

  return responseJson;
}

async function fetchOpenAIResponse(model: OpenAIModel,
  systemPrompt: string,
  temperature : number,
  key: string,
  messages: Message[]) {
    let url = `${OPENAI_API_HOST}/v1/chat/completions`;
    if (OPENAI_API_TYPE === 'azure') {
      url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
    }

    const functions = [
      {
          "name": "search_for_polaris_component",
          "description": "To build the UI, get the Polaris UI Component that corresponds to the given description",
          "parameters": {
              "type": "object",
              "properties": {
                  "description": {
                      "type": "string",
                      "description": "The description or name of the Polaris UI component you are looking for.",
                  },
              },
              "required": ["description"],
          },
      }
    ] ;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(OPENAI_API_TYPE === 'openai' && {
          Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...(OPENAI_API_TYPE === 'azure' && {
          'api-key': `${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...((OPENAI_API_TYPE === 'openai' && OPENAI_ORGANIZATION) && {
          'OpenAI-Organization': OPENAI_ORGANIZATION,
        }),
      },
      method: 'POST',
      body: JSON.stringify({
        ...(OPENAI_API_TYPE === 'openai' && {model: model.id}),
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        functions: functions,
        max_tokens: 1000,
        temperature: temperature,
        stream: false,
      }),
    });

    return res;
}
export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature : number,
  key: string,
  messages: Message[],
) => {
  const res = await fetchOpenAIResponse(model, systemPrompt, temperature, key, messages);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const response = await res.json();
  const responseMessage = response.choices[0].message;
  // console.log("responseMessage", responseMessage);
  // Step 2: check if GPT wanted to call a function
  if (responseMessage.function_call) {
    console.log("responseMessage.function_call", responseMessage.function_call);
    // Step 3: call the function
    // Note: the JSON response may not always be valid; be sure to handle errors
    const availableFunctions = {
      search_for_polaris_component: search_for_polaris_component,
    };  // only one function in this example, but you can have multiple
    const functionName = responseMessage.function_call.name;
    const functionToCall = availableFunctions[functionName];
    const functionArgs = JSON.parse(responseMessage.function_call.arguments);
    const functionResponse = await functionToCall(functionArgs.description);
    // console.log("👀 functionResponse", functionResponse);

    console.log("functionName", functionName);
    messages.push({
      role: responseMessage.role,
      content: responseMessage.content,
      name: responseMessage.name,
      function_call: {
        name: responseMessage.function_call.name,
        arguments: responseMessage.function_call.arguments
      },
    });  // extend conversation with assistant's reply
    // console.log("🚀 function Response", functionResponse);
    // console.log("👀 function Response", functionResponse.componentContent);
    messages.push({
        "role": "function",
        "name": functionName,
        "content": functionResponse.componentContent,
    });

    // console.log("👀 messages sent", messages);
    const response = await OpenAIStream(model, systemPrompt, temperature, key, messages);
    return response;
  }
  console.log("responseMessage", responseMessage);
  return responseMessage.content;
};
