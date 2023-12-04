function findFreeIntervals(intervals: number[][]) {
  if (intervals.length <= 0) {
    return [];
  }

  const result = [];

  // Sort the given interval based on the first number.
  intervals.sort((a, b) => a[0] - b[0]);

  // Iterate over all the intervals
  for (let i = 1; i < intervals.length; i++) {
    // Previous interval end
    let prevEnd = intervals[i - 1][1];

    // Current interval start
    let currStart = intervals[i][0];

    // If prev end is less than curr start, then it is free interval
    if (prevEnd < currStart) {
      result.push([prevEnd, currStart]);
    }
  }

  return result;
}

const findFreeIntervalsInLeft = (left: number[][], right: number[][]) => {
  const result = [];
  const freeIntervals = findFreeIntervals(right);

  for (const freeInterval of freeIntervals) {
    for (const interval of left) {
      const [start, end] = interval;
      const [freeStart, freeEnd] = freeInterval;
      if (freeStart >= start && freeEnd <= end) {
        result.push(freeInterval);
      }
    }
  }

  return result;
};

// console.log(
//   findFreeIntervalsInLeft(
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
// );
