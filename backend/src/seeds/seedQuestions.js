// Seed predefined system questions
// Run: node src/seeds/seedQuestions.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PREDEFINED_QUESTIONS = [
    {
        title: "Two Sum",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: "easy",
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "",
            },
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists.",
        ],
        starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
}

// Test
console.log(twoSum([2,7,11,15], 9));`,
            python: `def two_sum(nums, target):
    # Your code here
    pass

# Test
print(two_sum([2,7,11,15], 9))`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
            cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`,
        },
        testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
            { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
            { input: "[3,3]\n6", output: "[0,1]", isHidden: true },
        ],
        isSystem: true,
    },
    {
        title: "Valid Palindrome",
        description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.`,
        difficulty: "easy",
        examples: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: "true",
                explanation: '"amanaplanacanalpanama" is a palindrome.',
            },
            {
                input: 's = "race a car"',
                output: "false",
                explanation: '"raceacar" is not a palindrome.',
            },
        ],
        constraints: [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters.",
        ],
        starterCode: {
            javascript: `function isPalindrome(s) {
    // Your code here
}

// Test
console.log(isPalindrome("A man, a plan, a canal: Panama"));`,
            python: `def is_palindrome(s):
    # Your code here
    pass

# Test
print(is_palindrome("A man, a plan, a canal: Panama"))`,
            java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
}`,
            cpp: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Your code here
    return false;
}`,
        },
        testCases: [
            { input: "A man, a plan, a canal: Panama", output: "true", isHidden: false },
            { input: "race a car", output: "false", isHidden: false },
            { input: " ", output: "true", isHidden: true },
        ],
        isSystem: true,
    },
    {
        title: "Reverse Linked List",
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        difficulty: "easy",
        examples: [
            {
                input: "head = [1,2,3,4,5]",
                output: "[5,4,3,2,1]",
                explanation: "",
            },
            {
                input: "head = [1,2]",
                output: "[2,1]",
                explanation: "",
            },
        ],
        constraints: [
            "The number of nodes in the list is the range [0, 5000].",
            "-5000 <= Node.val <= 5000",
        ],
        starterCode: {
            javascript: `function reverseList(head) {
    // Your code here
}`,
            python: `def reverse_list(head):
    # Your code here
    pass`,
            java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }
}`,
            cpp: `ListNode* reverseList(ListNode* head) {
    // Your code here
    return nullptr;
}`,
        },
        testCases: [
            { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false },
            { input: "[1,2]", output: "[2,1]", isHidden: false },
        ],
        isSystem: true,
    },
    {
        title: "Merge Two Sorted Lists",
        description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
        difficulty: "easy",
        examples: [
            {
                input: "list1 = [1,2,4], list2 = [1,3,4]",
                output: "[1,1,2,3,4,4]",
                explanation: "",
            },
            {
                input: "list1 = [], list2 = []",
                output: "[]",
                explanation: "",
            },
        ],
        constraints: [
            "The number of nodes in both lists is in the range [0, 50].",
            "-100 <= Node.val <= 100",
            "Both list1 and list2 are sorted in non-decreasing order.",
        ],
        starterCode: {
            javascript: `function mergeTwoLists(list1, list2) {
    // Your code here
}`,
            python: `def merge_two_lists(list1, list2):
    # Your code here
    pass`,
            java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your code here
        return null;
    }
}`,
            cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Your code here
    return nullptr;
}`,
        },
        testCases: [
            { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", isHidden: false },
            { input: "[]\n[]", output: "[]", isHidden: false },
        ],
        isSystem: true,
    },
    {
        title: "Maximum Subarray",
        description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
        difficulty: "medium",
        examples: [
            {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
            },
            {
                input: "nums = [1]",
                output: "1",
                explanation: "The subarray [1] has the largest sum 1.",
            },
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
        ],
        starterCode: {
            javascript: `function maxSubArray(nums) {
    // Your code here (Kadane's Algorithm)
}

// Test
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
            python: `def max_sub_array(nums):
    # Your code here (Kadane's Algorithm)
    pass

# Test
print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
            cpp: `int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}`,
        },
        testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", isHidden: false },
            { input: "[1]", output: "1", isHidden: false },
            { input: "[5,4,-1,7,8]", output: "23", isHidden: true },
        ],
        isSystem: true,
    },
    {
        title: "Climbing Stairs",
        description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
        difficulty: "easy",
        examples: [
            {
                input: "n = 2",
                output: "2",
                explanation: "There are two ways: (1+1) and (2).",
            },
            {
                input: "n = 3",
                output: "3",
                explanation: "There are three ways: (1+1+1), (1+2), and (2+1).",
            },
        ],
        constraints: ["1 <= n <= 45"],
        starterCode: {
            javascript: `function climbStairs(n) {
    // Your code here
}

// Test
console.log(climbStairs(3));`,
            python: `def climb_stairs(n):
    # Your code here
    pass

# Test
print(climb_stairs(3))`,
            java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}`,
            cpp: `int climbStairs(int n) {
    // Your code here
    return 0;
}`,
        },
        testCases: [
            { input: "2", output: "2", isHidden: false },
            { input: "3", output: "3", isHidden: false },
            { input: "4", output: "5", isHidden: true },
        ],
        isSystem: true,
    },
];

async function seedQuestions() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        // Import Question model
        const Question = (await import("../models/Question.js")).default;

        // Check if system questions already exist
        const existingCount = await Question.countDocuments({ isSystem: true });
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing system questions. Skipping seed.`);
            process.exit(0);
        }

        // Insert predefined questions
        await Question.insertMany(PREDEFINED_QUESTIONS);
        console.log(`✅ Seeded ${PREDEFINED_QUESTIONS.length} predefined questions`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedQuestions();
