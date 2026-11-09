/* The contact form's lifecycle as one value, so the screen can only ever be in
   one state: the form, the form sending, the form with an error, or the
   confirmation. Every change goes through sendReducer.

   idle --submit--> sending --sent--> sent --reset--> idle
                       |
                       +--fail--> error --edit / clear--> idle

   `sent` and `fail` are accepted from any state: EmailJS cannot be aborted, so
   a send the timeout already gave up on can still land, and its real outcome
   replaces whatever is on screen (a late success ends on the confirmation and
   takes the timeout's toast with it). An error's toast is dismissed first
   (`toast: false`) and its message cleared 300 ms later, so the inline email
   error does not vanish while the toast is still sliding out. */

export type SendState =
   | { status: "idle" }
   | { status: "sending" }
   | {
        status: "error";
        message: string;
        /** The field the message is about, shown inline under it. */
        field?: "email";
        toast: boolean;
     }
   | { status: "sent"; name: string };

export type SendEvent =
   | { type: "submit" }
   | { type: "sent"; name: string }
   | { type: "fail"; message: string; field?: "email" }
   /** The send's wait is over; ends a `sending` that no outcome replaced. */
   | { type: "settle" }
   | { type: "edit" }
   | { type: "dismiss" }
   | { type: "clear" }
   | { type: "reset" };

export const IDLE: SendState = { status: "idle" };

export const sendReducer = (state: SendState, event: SendEvent): SendState => {
   switch (event.type) {
      case "submit":
         return { status: "sending" };
      case "sent":
         return { status: "sent", name: event.name };
      case "fail":
         return {
            status: "error",
            message: event.message,
            field: event.field,
            toast: true,
         };
      case "settle":
         return state.status === "sending" ? IDLE : state;
      case "edit":
         return state.status === "error" ? IDLE : state;
      case "dismiss":
         return state.status === "error" && state.toast
            ? { ...state, toast: false }
            : state;
      case "clear":
         return state.status === "error" && !state.toast ? IDLE : state;
      case "reset":
         return state.status === "sent" ? IDLE : state;
   }
};
