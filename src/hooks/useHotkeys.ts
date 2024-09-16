import { useEffect, useLayoutEffect, useRef } from "react";

type CombinationKey = "alt" | "ctrl" | "meta" | "shift";

export const useHotkeys = (
 key: string,
 combinationKey: null | CombinationKey,
 callback: (event: KeyboardEvent) => void
) => {
 const callbackRef = useRef(callback);

 useLayoutEffect(() => {
   callbackRef.current = callback;
 });

 useEffect(() => {
   const handler = (event: KeyboardEvent) => {
     if (
       (!combinationKey || event[`${combinationKey}Key`]) &&
       event.key === key
     ) {
       callbackRef.current(event);
     }
   };

   document.addEventListener("keydown", handler);
   return () => document.removeEventListener("keydown", handler);
 }, [key, combinationKey]);
};
