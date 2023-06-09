import { BlueButton } from "../components/buttons";
import { trpc } from "../providers/trpc";
import { useDialogueState } from "./DialogueState";
declare const responsiveVoice: any;

export const UserInputForm = ({
  setToastOn,
}: {
  setToastOn: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [
    userInput,
    setUserInput,
    disabledChat,
    language,
    addNewMessage,
    userMessageList,
    addNewUserMessage,
    botMessageList,
    addNewBotMessage,
  ] = useDialogueState((state) => [
    state.userInput,
    state.setUserInput,
    state.disabledChat,
    state.language,
    state.addNewMessage,
    state.userMessageList,
    state.addNewUserMessage,
    state.botMessageList,
    state.addNewBotMessage,
  ]);

  const { mutate: submitText } = trpc.chatBot.submitUserInput.useMutation();

  function handleSendButtonClick() {
    if (!userInput) {
      console.error("You are not texting");
      return;
    }
    addNewMessage(userInput);
    sendUserInput(userInput, language);
  }

  function sendUserInput(
    userInput: string,
    language: string,
    retryCounter = 5
  ) {
    const convoPayload: apiInput = createConvoPayload(
      userMessageList,
      botMessageList,
      userInput
    );

    submitText(
      { convoPayload: JSON.stringify(convoPayload), language: language },
      {
        onSuccess: async (response) => {
          if (response.isSuccess) {
            const chatBotReply = response.content;
            if (chatBotReply) {
              addNewUserMessage(userInput);
              addNewBotMessage(chatBotReply);
              addNewMessage(chatBotReply);
              responsiveVoice.speak(chatBotReply, "UK English Male");
              setUserInput("");
            } else {
              console.error("No reply");
            }
          } else if (!response.isSuccess && retryCounter > 0) {
            await new Promise((f) => setTimeout(f, 5000));
            console.error("Retry: #" + Math.abs(retryCounter - 4));
            sendUserInput(userInput, language, retryCounter - 1);
          } else {
            setToastOn(true);
            setTimeout(() => {
              setToastOn(false);
            }, 5000);
          }
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  }

  return (
    <div title="User Input Form" className="mb-2 flex items-center ">
      <textarea
        className="focus:shadow-outline w-[200px] appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none disabled:bg-gray-600 sm:w-96"
        id="prompt"
        value={userInput}
        onChange={(event) => setUserInput(event.target.value)}
        disabled={disabledChat}
      />
      <BlueButton
        onClick={handleSendButtonClick}
        disabled={disabledChat}
        className="h-fit align-middle"
      >
        Send
      </BlueButton>
    </div>
  );
};

type apiInput = {
  inputs: {
    past_user_inputs: string[];
    generated_responses: string[];
    text: string;
  };
};

const createConvoPayload = (
  userMessageList: string[],
  botMessageList: string[],
  userInput: string
): apiInput => {
  return {
    inputs: {
      past_user_inputs: userMessageList,
      generated_responses: botMessageList,
      text: userInput,
    },
  };
};
