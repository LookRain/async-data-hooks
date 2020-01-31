import { assign, createMachine } from 'xstate';

export type StateTypes =
  | 'Idle'
  | 'PostPending'
  | 'PostFinished'
  | 'PostFinished.PostSucceeded'
  | 'PostFinished.PostFailed';

const makeMachine = <ReqData, RespData>(prefix?: string) => {
  type PostDataMachineEvent =
    | { type: 'REQUEST'; reqData: ReqData }
    | { type: 'done.invoke.postData'; data: RespData }
    | { type: 'RESET' }
    | { type: 'error.platform.postData'; data: Error };

  type PostDataMachineContext = {
    reqData?: ReqData | undefined;
    responseData?: RespData | undefined;
    error?: Error | undefined;
  };

  type PostDataMachineState =
    | {
        value: 'Idle';
        context: PostDataMachineContext & {
          reqData: undefined;
          responseData: undefined;
          error: undefined;
        };
      }
    | {
        value: 'PostPending';
        context: PostDataMachineContext & {
          reqData: ReqData;
          responseData: undefined;
          error: undefined;
        };
      }
    | {
        value: 'PostFinished.PostSucceeded';
        context: PostDataMachineContext & {
          reqData: ReqData;
          responseData: RespData;
          error: undefined;
        };
      }
    | {
        value: 'PostFinished.PostFailed';
        context: PostDataMachineContext & {
          reqData: ReqData;
          responseData: undefined;
          error: Error;
        };
      };

  return createMachine<
    PostDataMachineContext,
    PostDataMachineEvent,
    PostDataMachineState
  >(
    {
      id: prefix,
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            REQUEST: 'PostPending',
          },
        },
        PostPending: {
          on: {
            REQUEST: 'PostPending',
          },
          invoke: {
            src: 'postData',
            onDone: {
              target: 'PostFinished.PostSucceeded',
              actions: 'updateData',
            },
            onError: {
              target: 'PostFinished.PostFailed',
              actions: 'updateError',
            },
          },
        },

        PostFinished: {
          on: {
            REQUEST: 'PostPending',
          },
          states: {
            PostSucceeded: {},
            PostFailed: {
              exit: 'clearError',
            },
          },
        },
      },
    },
    {
      actions: {
        updateData: assign({
          responseData: (_, event) =>
            event.type === 'done.invoke.postData'
              ? event.data
              : (event as any).data,
        }),
        clearData: assign({
          responseData: (_, event) =>
            event.type === 'RESET' ? undefined : undefined,
        }),
        updateError: assign({
          error: (_, event) =>
            event.type === 'error.platform.postData'
              ? event.data
              : (event as any).data,
        }),
        clearError: assign({
          error: (_, event) =>
            event.type === 'REQUEST' ? undefined : undefined,
        }),
      },
    },
  );
};

export default makeMachine;
