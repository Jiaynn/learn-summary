### git指令

git reflog  查看精简的版本信息

显示整个本地仓库的commit，包括所有branch的commit，甚至包括已经撤销的commit。

git log   查看版本详细信息 

回滚版本：git reset --hard 版本号

取消暂存的文件：git reset HADE <file>

撤销对文件的修改：git checkout -- <file>

git status  查看修改的状态

git branch                    查看分支

git branch 分支名       创建分支

git checkout  分支名    切换分支

git checkout -b 分支名    创建并切换到这个分支

git checkout .    将暂存区的内容清掉

合并分支

git merge 分支名

冲突合并：合并分支时，两个分支在同一个文件的同一位置有不同的修改，就会发生合并冲突

需要我们手动合并代码，在主分支上直接查看冲突的文件

![](C:\Users\李佳燕\Desktop\QQ截图20220728173507.png)

自己修改这个文件，然后 在git add . 存入暂存区然后git commit 提交到本地仓库

合并分支只会修改你合并的那个分支

git branch -d b1 删除分支时，需要做各种检查

git branch -D b1 不做任何检查，强制删除

git remote -v    显示所有远程仓库

//给远程仓库创建别名

git remote add git-demo htps://ddibewdi

//推送到远程仓库

git  push 别名 分支

创建文件：touch 文件名

git diff：假如编辑 `LICENSE` 文件后先不暂存，不加参数直接输入 `git diff`：得到的是工作目录中当前文件与暂存区的文件的差异

若要查看已暂存的将要添加到下次提交里的内容，可以用 `git diff --staged` 或 `git diff --cached` 命令。 这条命令将比对已暂存文件与最后一次提交的文件差异。

git remote -v 查看远程仓库

git rebase 

git fetch

git merge

git pull origin
克隆仓库的所有分支
for b in `git branch -r | grep -v -- '->'`; do git branch --track ${b##origin/} $b; done

### Linux指令

cat：用于查看文件的内容

#### 项目规范：









滚动条 