import { assign, createMachine } from 'xstate';

export type StateTypes =
  | 'Idle'
  | 'FetchPending'
  | 'LoadFinished'
  | 'LoadFinished.LoadSucceeded'
  | 'LoadFinished.LoadFailed';

const makeMachine = <T>(prefix?: string) => {
  type FetchDataMachineEvent =
    | { type: 'done.invoke.fetchData'; data: T }
    | { type: 'error.platform.fetchData'; data: Error }
    | { type: 'REQUEST'; params?: { [x: string]: any } }
    | { type: 'RESET' };
  type FetchDataMachineContext = {
    data?: T | undefined;
    error?: Error | undefined;
  };
  type FetchDataMachineState =
    | {
        value: 'Idle';
        context: {
          data: undefined;
          error: undefined;
        };
      }
    | {
        value: 'FetchPending';
        context: {
          data: undefined;
          error: undefined;
        };
      }
    | {
        value: 'LoadFinished.LoadSucceeded';
        context: {
          data: T;
          error: undefined;
        };
      }
    | {
        value: 'LoadFinished.LoadFailed';
        context: {
          data: undefined;
          error: Error;
        };
      };

  return createMachine<
    FetchDataMachineContext,
    FetchDataMachineEvent,
    FetchDataMachineState
  >(
    {
      id: prefix,
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            REQUEST: 'FetchPending',
          },
          entry: ['clearError', 'clearData'],
        },
        FetchPending: {
          invoke: {
            src: 'fetchData',
            onDone: {
              target: 'LoadFinished.LoadSucceeded',
              actions: 'updateData',
            },
            onError: {
              target: 'LoadFinished.LoadFailed',
              actions: 'updateError',
            },
          },
        },

        LoadFinished: {
          on: {
            REQUEST: 'FetchPending',
            RESET: 'Idle',
          },
          states: {
            LoadSucceeded: {},
            LoadFailed: {
              exit: 'clearError',
            },
          },
        },
      },
    },
    {
      actions: {
        updateData: assign({
          data: (_, event) =>
            event.type === 'done.invoke.fetchData'
              ? event.data
              : (event as any).data,
        }),
        clearData: assign({
          data: (_, event) => (event.type === 'RESET' ? undefined : undefined),
        }),
        updateError: assign({
          error: (_, event) =>
            event.type === 'error.platform.fetchData'
              ? event.data
              : (event as any).data,
        }),
        clearError: assign({
          error: (_, event) => {
            return event.type === 'REQUEST' ? undefined : undefined;
          },
        }),
      },
    },
  );
};

export default makeMachine;
