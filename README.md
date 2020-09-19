# Noding RFC


# The RFC life cycle




```ts
git remote add origin git@github.com:yun-tai-system/rfcs.git
git branch -M master
git push -u origin master
```
// 包管理
基础组件 (版本号)（很少）(UI库)
组合组件 (版本1的基础组件+版本2的基础组件) （ui库+自制）
业务组件 (自己)
页面组件 自己

ng ---> http
vue --> axios(后端提供的sdk)

state
- 页面1 state ----> 后端交互 ---> axios(后端提供的sdk)
- 页面2 state ----> 后端交互
- 页面3 state ----> 后端交互

页面1
 结构+样式
页面2

页面3
