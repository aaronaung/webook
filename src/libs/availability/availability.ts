// findFreeIntervalsInLeft finds the free intervals in the left array, given the candidate intervals in the right array.
// For example: findFreeIntervalsInLeft(
//     [
//       [1, 5],
//       [10, 15],
//       [20, 30],
//     ],
//     [
//       [0, 2],
//       [3, 11],
//       [7, 12],
//       [14, 15],
//       [18, 30],
//     ],
//   ),
// returns [[2, 3], [12, 14]]
export const findFreeIntervalsInLeft = (
  left: number[][],
  right: number[][],
  logSteps = false,
) => {
  left.sort((a, b) => a[0] - b[0]);
  right.sort((a, b) => a[0] - b[0]);

  if (left.length <= 0) {
    return [];
  }
  if (right.length <= 0) {
    return left;
  }

  let lPtr = 0;
  let rPtr = 0;
  let candidateInterval: number[] = left[lPtr];
  let step = 0;
  const result = [];
  while (rPtr < right.length && lPtr < left.length) {
    step++;
    // until everthing in right has been checked.
    const [lStart, lEnd] = candidateInterval;
    const [rStart, rEnd] = right[rPtr];
    if (logSteps) {
      console.log("");
      console.log("step", step);
      console.log("candidate", candidateInterval);
      console.log("left: ", [lStart, lEnd]);
      console.log("right: ", right[rPtr]);
    }

    if (rStart >= lEnd) {
      if (
        candidateInterval.length > 0 &&
        candidateInterval[1] > candidateInterval[0]
      ) {
        result.push(candidateInterval);
      }
      lPtr++;
      candidateInterval = left[lPtr];
    } else if (rEnd <= lStart) {
      if (
        candidateInterval.length > 0 &&
        candidateInterval[1] > candidateInterval[0]
      ) {
        result.push(candidateInterval);
      }
      lPtr++;
      rPtr++;
      candidateInterval = left[lPtr];
    } else if (rStart <= lStart && rEnd < lEnd) {
      // free interval in left is established, but more intervals in right could overlap
      candidateInterval = [rEnd, lEnd];
      rPtr++;
    } else if (rStart > lStart && rEnd >= lEnd) {
      // rEnd could be farther out to cover more left intervals so we simply move lPtr
      result.push([lStart, rStart]);
      lPtr++;
      candidateInterval = left[lPtr];
    } else if (lStart >= rStart && lEnd <= rEnd) {
      // left is engulfed, nothing to add to result set
      lPtr++;
      candidateInterval = left[lPtr];
    } else if (rStart > lStart && rEnd < lEnd) {
      // left is split into two intervals, keep checking right
      result.push([lStart, rStart]);
      candidateInterval = [rEnd, lEnd];
      rPtr++;
    } else {
      lPtr++;
      candidateInterval = left[lPtr];
    }
    if (logSteps) {
      console.log("result", result);
    }
  }
  if (
    (candidateInterval || []).length > 0 &&
    candidateInterval[1] > candidateInterval[0]
  ) {
    result.push(candidateInterval);
    lPtr++;
  }
  for (let i = lPtr; i < left.length; i++) {
    result.push(left[i]);
  }
  return result;
};

// Flatten intervals flattens the intervals and merges the overlapping intervals. For example: [[0, 3], [3, 11], [7, 12], [14, 19], [18, 30]] will be flattened to [[0, 12], [14, 30]]
export function flattenIntervals(intervals: number[][]) {
  if (intervals.length === 0) {
    return [];
  }
  intervals.sort((a, b) => a[0] - b[0]);

  const flattened = [];
  let current = intervals[0];
  for (const interval of intervals) {
    const [start, end] = interval;
    const [currentStart, currentEnd] = current;
    if (start > currentEnd) {
      flattened.push(current);
      current = interval;
      continue;
    }
    if (start >= currentStart && end > currentEnd) {
      current[1] = end;
    }
  }
  flattened.push(current);
  return flattened;
}

//Todo: important - ideally this should be done in the database right before a booking is made to ensure no double booking ever occurs.
export function isIntervalAvailable(
  candidateInterval: number[],
  busyIntervals: number[][],
) {
  for (const interval of busyIntervals) {
    const [busyStart, busyEnd] = interval;
    const [candidateStart, candidateEnd] = candidateInterval;
    if (candidateStart >= busyEnd || candidateEnd <= busyStart) {
      continue;
    }
    if (candidateStart <= busyStart && candidateEnd >= busyEnd) {
      // current busy interval is completely inside candidate interval
      return false;
    }
    if (candidateStart <= busyStart && candidateEnd < busyEnd) {
      // candidate interval overlaps with the busyStart of current interval
      return false;
    }
    if (candidateStart > busyStart && candidateEnd >= busyEnd) {
      // candidate interval overlaps with the busyEnd of current interval
      return false;
    }
    if (candidateStart > busyStart && candidateEnd < busyEnd) {
      // candidate interval is completely inside current interval
      return false;
    }
  }
  return false;
}
