/*
 * LeetCode Solution: Length of Last Word
 * Difficulty: Medium
 * Language: python
 * URL: https://leetcode.com/problems/length-of-last-word/
 * Date: 15/02/2026, 15:17:55
 * Solution: Initial
 */

class Solution:
    def lengthOfLastWord(self, s: str) -> int:
        i, length = len(s) - 1, 0

        while s[i] == " ":
            i -= 1
        while i >= 0 and s[i] != " ":
            length += 1
            i -= 1
        return length