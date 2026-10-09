/* Renders a headline string where one word is wrapped in *asterisks* as that
   word in the italic serif accent (.accent-serif). Everything else is plain
   text, so data stays readable and unmarked strings render unchanged. */

import { segments } from "@utils/accentSegments";

const AccentText = ({ text }: { text: string }) => (
   <>
      {segments(text).map(({ at, text: part, accent }) =>
         accent ? (
            <em key={at} className="accent-serif">
               {part}
            </em>
         ) : (
            <span key={at}>{part}</span>
         ),
      )}
   </>
);

export default AccentText;
