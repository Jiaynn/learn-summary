## [1. 两数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/two-sum/)

这个题的思路就是使用一个map存一下当前值和对应的索引值

## [15. 三数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/3sum/)

给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。

思路：他是一个三元组，所以我们就要想到用三个指针 先固定一个数，然后L=i+1,R=nums.length-1
不能有重复的三元组，所以当num[i]==num[i+1]时要跳过还有就是当和为0时，start++，end--时也需要去重