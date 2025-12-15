/**
 * 時間関連の副作用（I/O）を提供するインフラ層
 * new Date()の呼び出しはここに集約
 */

/**
 * 現在時刻のDateオブジェクトを取得
 */
export const getNow = (): Date => new Date();

/**
 * 現在の年を取得
 */
export const getCurrentYear = (): number => new Date().getFullYear();
