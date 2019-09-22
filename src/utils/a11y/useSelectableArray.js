/**
 * This hook is meant to provide a utility to help with selectable arrays
 * this hook is able to be used in general scenarios where a selectable array
 * is allowed, regardless of whether it's a keyboard that selects them or not
 *
 * ✅ Assign a unique ID to every item
 * ✅ Return a filtered list of what is currently selected
 * ✅ Add in helper inputs to help compose with other hooks
 * ✅ Safe-guard too high and too low inputs
 * ✅ Have a select all method
 */

import { useCallback, useEffect, useMemo, useRef } from "react"
import { genId } from "./getNewId"
import { normalizeNumber } from "../normalize-number"

const getNewArr = (valArr) => {
  return valArr.map((val, i) => {
    return {
        id: genId(),
        val,
        index: i,
        selected: false
      };
    }
  );
}

/**
 *
 * @param valArr
 * @param [runAfterSelectChange] There may be instances where changing the `ref`
 *     does not have the expected functionality if using it as a dep instance.
 *     By using this function + a `useRef` and a number to manually toggle re-runs
 *     you can fix this problem.
 * @returns {{markAsSelected: *, selectedArr: *, selectAll: *, internalArr: *}}
 */
export const useSelectableArray = (valArr, runAfterSelectChange) => {
  /**
   * Using a `useRef` here for performance. Otherwise, to keep immutability
   * there's all kinds of hacks that must be implemented
   */
  const internalArrRef = useRef(getNewArr(valArr));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    internalArrRef.current = getNewArr(valArr);
  }, [valArr])

  const currInternalArr = internalArrRef && internalArrRef.current;

  // This will be empty if `enableSelect` is null
  const selectedArr = useMemo(() =>
      currInternalArr.filter(item => item.selected),
    [currInternalArr],
  )

  const markAsSelected = useCallback((fromIndex, toIndex) => {
    const maxIndex = currInternalArr.length - 1;

    const newFromIndex = normalizeNumber(fromIndex, 0, maxIndex);
    const newToIndex = normalizeNumber(toIndex, 0, maxIndex);

    // Handle single selection properly
    if (newToIndex === newFromIndex && fromIndex === toIndex) {
      currInternalArr[toIndex].selected = !currInternalArr[toIndex].selected;
      runAfterSelectChange && runAfterSelectChange()
      return
    }

    const smallerNum = newFromIndex > newToIndex ? newToIndex : newFromIndex;
    const biggerNum = newFromIndex > newToIndex ?  newFromIndex : newToIndex;

    for (let i = smallerNum; i <= biggerNum; i++) {
      currInternalArr[i].selected = true;
    }

    runAfterSelectChange && runAfterSelectChange()
  }, [currInternalArr, runAfterSelectChange])

  const selectAll = () => {
    internalArrRef.current.forEach((val, i, arr) => {
      val.selected = true

      if (i === arr.length - 1) {
        runAfterSelectChange && runAfterSelectChange()
      }
    })
  }

  return {
    selectedArr,
    selectAll,
    markAsSelected,
    internalArr: internalArrRef.current
  }
}
