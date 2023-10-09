import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Result } from 'postcss';
import { documentationOfSharedState } from '../shopifyRNDocumentation/documentationOfSharedState';
import { documentationOfUseActions } from '../shopifyRNDocumentation/useActionsDocumentation';
import {screenNavigationSetupDocumentation} from '../shopifyRNDocumentation/screenNavigationSetupDocumentation';
import { documentationForListWithSourceUsage } from '../shopifyRNDocumentation/documentationForListWithSourceUsage';

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

function use_Actions_documentation() {
  return documentationOfUseActions();
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
          "name": "documentation_for_searched_polaris_component",
          "description": "search and provide the documentation of Polaris UI component you are looking for, if it exists",
          "parameters": {
              "type": "object",
              "properties": {
                  "description": {
                      "type": "string",
                      "description": "The description of the Polaris UI component you are looking for. Try to give a good description, not only one word or two.",
                  },
              },
              "required": ["description"],
          },
      },
      {
        "name": "use_Actions_documentation",
        "description": "Documentation on how to use `useActions` hook",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        }
      },
      {
        "name": "shared_state_documentation",
        "description": "Documentation on how to use `useSharedState` hook",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        },
      },
      {
        "name": "screen_navigation_setup_documentation",
        "description": "Documentation on how to setup screen navigation",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        },
      },
      {
        "name": "documentation_for_list_with_source_usage",
        "description": "`ListWithSource` guide",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        },
      }
    ] ;
    // console.log("🔥 messages:\n", messages);
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
        // max_tokens: 1000,
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
    console.log("👀 responseMessage.function_call", responseMessage);
    // Step 3: call the function
    // Note: the JSON response may not always be valid; be sure to handle errors
    const availableFunctions = {
      documentation_for_searched_polaris_component: search_for_polaris_component,
      use_Actions_documentation: use_Actions_documentation,
      shared_state_documentation: documentationOfSharedState,
      screen_navigation_setup_documentation: screenNavigationSetupDocumentation,
      documentation_for_list_with_source_usage: documentationForListWithSourceUsage
    };  // only one function in this example, but you can have multiple
    const functionName = responseMessage.function_call.name;
    const functionToCall = availableFunctions[functionName];
    const functionArgs = JSON.parse(responseMessage.function_call.arguments);
    messages.push({
      role: responseMessage.role,
      content: "",
      name: responseMessage.name,
      function_call: {
        name: responseMessage.function_call.name,
        arguments: responseMessage.function_call.arguments
      },
    });
    if (functionName === "documentation_for_searched_polaris_component") {
    const functionResponse = await functionToCall(functionArgs.description);
    // console.log("👀 functionResponse", functionResponse);

    console.log("functionName", functionName);
    console.log("👀 function Response", functionResponse.componentContent);
    messages.push({
        "role": "function",
        "name": functionName,
        "content": functionResponse.componentContent,
    });
  } else if ((functionName === "shared_state_documentation") ||
  (functionName === "screen_navigation_setup_documentation") ||
  (functionName === "use_Actions_documentation") ||
  (functionName === "documentation_for_list_with_source_usage")) {
    console.log("👀 calling: ", functionName);
    const functionResponse = await functionToCall();
    // console.log("👀 functionResponse", functionResponse);

    console.log("functionName", functionName);
    console.log("👀 function Response", functionResponse);
    messages.push({
        "role": "function",
        "name": functionName,
        "content": functionResponse,
    });
  }
    // console.log("👀 messages sent", messages);
    const response = await OpenAIStream(model, systemPrompt, temperature, key, messages);
    return response;
  }
  // console.log("responseMessage", responseMessage);
  const updatedMessages: Message[] = [
    ...messages,
    // Add a name property to fix the error
    { role: 'assistant', name: 'assistant', content: responseMessage.content },
  ];
  // console.log("👀 updatedMessages = ", JSON.stringify(updatedMessages));
  return JSON.stringify(updatedMessages);
};
