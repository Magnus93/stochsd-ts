import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  it.each([
    [666666.666, { precision: 2 }, "666667"],
    [666666.666, { precision: 3 }, "666667"],
    [666666.666, { precision: 4 }, "666667"],
    [666666.666, { precision: 5 }, "666667"],
    [666666.666, { precision: 6 }, "666667"],
    [666666.666, { precision: 7 }, "666666.7"],
    [666666.666, { precision: 8 }, "666666.67"],
    [666666.666, { precision: 9 }, "666666.666"],
    [666666, { precision: 9 }, "666666.000"],
    [10375, { precision: 4 }, "10375"],
    [100000001, { precision: 9 }, "100.000001e+6"],
    [100000001, { precision: 8 }, "100.00000e+6"],
    [6661.6666, { precision: 1 }, "6662"],
    [6661.6666, { precision: 2 }, "6662"],
    [6661.6666, { precision: 3 }, "6662"],
    [6661.6666, { precision: 4 }, "6662"],
    [6661.6666, { precision: 5 }, "6661.7"],
    [6661.6666, { precision: 6 }, "6661.67"],
    [6661.6666, { precision: 7 }, "6661.667"],
    [6661.6666, { precision: 8 }, "6661.6666"],
    [9999.5, { precision: 1 }, "10000"],
    [9999.5, { precision: 2 }, "10000"],
    [9999.5, { precision: 3 }, "10000"],
    [9999.5, { precision: 4 }, "10000"],
    [9999.5, { precision: 5 }, "9999.5"],
    [0.001956, { precision: 1 }, "0.002"],
    [0.001956, { precision: 2 }, "0.0020"],
    [0.001956, { precision: 3 }, "0.00196"],
    [0.001956, { precision: 4 }, "0.001956"],
    [0.1872, { precision: 1 }, "0.2"],
    [0.1872, { precision: 2 }, "0.19"],
    [0.1872, { precision: 3 }, "0.187"],
    [0.1872, { precision: 4 }, "0.1872"],
    [0.1872, { decimals: 0 }, "0"],
    [0.1872, { decimals: 1 }, "0.2"],
    [0.1872, { decimals: 2 }, "0.19"],
    [0.1872, { decimals: 4 }, "0.1872"],
    [0.00006, { decimals: 6 }, "0.000060"],
  ])("formatNumber tests", (value: number, options: any, expected: string) => {
    expect(formatNumber(value, options)).toEqual(expected)
  })
})

