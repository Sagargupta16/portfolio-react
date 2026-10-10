/* Renders body copy with the first occurrence of each glossary term as a
   Gloss trigger, so non-technical readers can look up cloud jargon in place.
   Strings without glossary terms render unchanged. */

import { GLOSSARY_BY_TERM, segmentGloss } from "@utils/glossary";
import Gloss from "./Gloss";

const GlossText = ({ text }: { text: string }) => (
   <>
      {segmentGloss(text).map(({ at, text: part, term }) => {
         const entry = term ? GLOSSARY_BY_TERM.get(term) : undefined;
         return entry ? (
            <Gloss key={at} term={entry.term} definition={entry.definition}>
               {part}
            </Gloss>
         ) : (
            <span key={at}>{part}</span>
         );
      })}
   </>
);

export default GlossText;
