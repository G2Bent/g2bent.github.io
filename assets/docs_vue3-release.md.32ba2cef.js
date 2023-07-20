import{_ as l,c as p,b as o,a as n,d as s,o as e,r as t}from"./app.42ca4e10.js";const c="/blog/assets/vue3-release0.69de6b0d.png",m=JSON.parse('{"title":"纪年 |【第三期】Vue3 Release 源码解读记录","description":"","frontmatter":{"date":"2021-08-25T00:00:00.000Z","title":"纪年 |【第三期】Vue3 Release 源码解读记录","tags":["源码","vue3"],"describe":"Vue3 Release 源码解读"},"headers":[{"level":2,"title":"1. 学习目标和资源准备","slug":"_1-学习目标和资源准备","link":"#_1-学习目标和资源准备","children":[]},{"level":2,"title":"2. Yarn Workspace","slug":"_2-yarn-workspace","link":"#_2-yarn-workspace","children":[]},{"level":2,"title":"3. release.js 文件解读","slug":"_3-release-js-文件解读","link":"#_3-release-js-文件解读","children":[{"level":3,"title":"main 函数","slug":"main-函数","link":"#main-函数","children":[]}]},{"level":2,"title":"4. 感想","slug":"_4-感想","link":"#_4-感想","children":[]},{"level":2,"title":"5. 实践","slug":"_5-实践","link":"#_5-实践","children":[]}],"relativePath":"docs/vue3-release.md"}'),r={name:"docs/vue3-release.md"},y=n(`<blockquote><p>【若川】Vue3 Release 源码解读：<a href="https://juejin.cn/post/6997943192851054606" target="_blank" rel="noreferrer">https://juejin.cn/post/6997943192851054606</a></p></blockquote><h2 id="_1-学习目标和资源准备" tabindex="-1">1. 学习目标和资源准备 <a class="header-anchor" href="#_1-学习目标和资源准备" aria-hidden="true">#</a></h2><p>这一期阅读的是 Vue3 源码中的 script/release.js 代码，也就是 Vue.js 的发布流程。在上一期源码阅读中从 <a href="https://github.com/vuejs/vue-next/blob/master/.github/contributing.md" target="_blank" rel="noreferrer">.github/contributing.md</a> 了解到 Vue.js 采用的是 monorepo 的方式进行代码的管理。</p><p>monorepo 是管理项目代码的一个方式，指在一个项目仓库 (repo) 中管理多个模块/包 (package)，不同于常见的每个 package 都建一个 repo。</p><p>刚好我最近搭建组件库也是使用 monorepo 的方式去管理包。 monorepo 有个缺点，因为每个包都维护着自己的 dependencies，那么在 install 的时候会导致 node_modules 的体积非常大。目前最常见的 monorepo 解决方案是使用 lerna 和 yarn 的 workspaces 特性去处理仓库的依赖，我搭建的组件库也是使用了 lerna 和 yarn。但 Vue3 的包管理没有使用 lerna，它是怎么管理依赖包的版本号呢？让我们跟着源码一探究竟。</p><blockquote><p><a href="https://www.lernajs.cn/" target="_blank" rel="noreferrer">Lerna</a> 是一个管理工具，用于管理包含多个软件包（package）的 JavaScript 项目，针对使用 git 和 npm 管理多软件包代码仓库的工作流程进行优化。</p></blockquote><p><strong>学习目标：</strong></p><p>1）学习 release.js 源码，输出记录文档。</p><p><strong>资源准备：</strong></p><p>Vue3 源码地址：<code>https://github.com/vuejs/vue-next</code></p><h2 id="_2-yarn-workspace" tabindex="-1">2. Yarn Workspace <a class="header-anchor" href="#_2-yarn-workspace" aria-hidden="true">#</a></h2><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// vue-next/package.json （多余的代码已省略）</span></span>
<span class="line"><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">private</span><span style="color:#89DDFF;">&quot;</span><span style="color:#F07178;">: </span><span style="color:#FF9CAC;">true</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">version</span><span style="color:#89DDFF;">&quot;</span><span style="color:#F07178;">: </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">3.2.2</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">workspaces</span><span style="color:#89DDFF;">&quot;</span><span style="color:#F07178;">: [</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">packages/*</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#F07178;">    ]</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">scripts</span><span style="color:#89DDFF;">&quot;</span><span style="color:#F07178;">: </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">&quot;</span><span style="color:#F07178;">release</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">node scripts/release.js</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>Yarn 从 1.0 版开始支持 Workspace （工作区），Workspace 可以更好的统一管理有多个项目的仓库。</p><ul><li>管理依赖关系便捷：每个项目使用独立的 package.json 管理依赖，可以使用 yarn 命令一次性安装或者升级所有依赖，无需在每个目录下分别安装依赖</li><li>降低磁盘空间占用：可以使多个项目共享同一个 node_modules 目录</li></ul><h2 id="_3-release-js-文件解读" tabindex="-1">3. release.js 文件解读 <a class="header-anchor" href="#_3-release-js-文件解读" aria-hidden="true">#</a></h2><p>先手动跑一遍 <code>yarn run release --dry</code>，控制台会输出以下信息（多余信息已省略），从控制台日志看出来，发布 Vue.js 会经历以下几个步骤：</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#A6ACCD;">// 确认发布版本号</span></span>
<span class="line"><span style="color:#A6ACCD;">? Select release type ... </span></span>
<span class="line"><span style="color:#A6ACCD;">&gt; patch (3.2.3)</span></span>
<span class="line"><span style="color:#A6ACCD;">  minor (3.3.0)</span></span>
<span class="line"><span style="color:#A6ACCD;">  major (4.0.0)</span></span>
<span class="line"><span style="color:#A6ACCD;">  custom</span></span>
<span class="line"><span style="color:#A6ACCD;">// 执行测试用例</span></span>
<span class="line"><span style="color:#A6ACCD;">Running tests...</span></span>
<span class="line"><span style="color:#A6ACCD;">// 更新依赖版本</span></span>
<span class="line"><span style="color:#A6ACCD;">Updating cross dependencies...</span></span>
<span class="line"><span style="color:#A6ACCD;">// 打包编译所有包</span></span>
<span class="line"><span style="color:#A6ACCD;">Building all packages...</span></span>
<span class="line"><span style="color:#A6ACCD;">// 生成 changelog</span></span>
<span class="line"><span style="color:#A6ACCD;">conventional-changelog -p angular -i CHANGELOG.md -s</span></span>
<span class="line"><span style="color:#A6ACCD;">// 提交代码</span></span>
<span class="line"><span style="color:#A6ACCD;">Committing changes...</span></span>
<span class="line"><span style="color:#A6ACCD;">// 发布包</span></span>
<span class="line"><span style="color:#A6ACCD;">Publishing packages...</span></span>
<span class="line"><span style="color:#A6ACCD;">// 推送代码到 GitHub</span></span>
<span class="line"><span style="color:#A6ACCD;">Pushing to GitHub...</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>初步了解发布流程后，来看看 release.js 源码做了什么，先看入口函数 main()</p><h3 id="main-函数" tabindex="-1">main 函数 <a class="header-anchor" href="#main-函数" aria-hidden="true">#</a></h3><p>代码太多就不贴代码了，记录一下思路和思考</p><ol><li>确认要发布的版本：</li></ol><ul><li><ul><li>如果从命令行获取到了版本号，先验证版本号规范，再次确认版本号</li><li>如果命令行没有输入版本号，会让用户选择一个版本发布</li></ul></li></ul><p>确认版本号使用了一个库叫 <strong>semver</strong>，它的作用是用于版本校验比较。</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// 目的是获取命令行参数（也就是允许用户自定义输入版本号，比如 yarn release v3.5.0）</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> args </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">require</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">minimist</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">)(process</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">argv</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">slice</span><span style="color:#A6ACCD;">(</span><span style="color:#F78C6C;">2</span><span style="color:#A6ACCD;">))</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> targetVersion </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> args</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">_[</span><span style="color:#F78C6C;">0</span><span style="color:#A6ACCD;">]</span></span>
<span class="line"></span></code></pre></div><ol start="2"><li>执行测试用例</li></ol><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> execa </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">require</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">execa</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> run </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;font-style:italic;">bin</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">args</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">opts</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{})</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">execa</span><span style="color:#A6ACCD;">(bin</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> args</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> </span><span style="color:#F07178;">stdio</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">inherit</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">...</span><span style="color:#A6ACCD;">opts </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> bin </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">name</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> path</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">resolve</span><span style="color:#A6ACCD;">(__dirname</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">../node_modules/.bin/</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> name)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#A6ACCD;"> (</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">skipTests </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">isDryRun) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// bin(&quot;jest&quot;) 先获取 node_modules/.bin/jest 的目录，run 的本质就是执行命令行</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 这行代码的意思就相当于在命令终端，项目根目录运行 ./node_modules/.bin/jest 命令。</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;font-style:italic;">await</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">run</span><span style="color:#F07178;">(</span><span style="color:#82AAFF;">bin</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">jest</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> [</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">--clearCache</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">])</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;font-style:italic;">await</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">run</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">yarn</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> [</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">test</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">--bail</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">])</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">else</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">(skipped)</span><span style="color:#89DDFF;">\`</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><ol start="3"><li>更新依赖版本</li></ol><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// 1）获取 packages 目录下的所有包</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> packages </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> fs</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">readdirSync</span><span style="color:#A6ACCD;">(path</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">resolve</span><span style="color:#A6ACCD;">(__dirname</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">../packages</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">))</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">filter</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;font-style:italic;">p</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">p</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">endsWith</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">.ts</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">p</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">startsWith</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">.</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">))</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// 1）获取包的根目录路径</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> getPkgRoot </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">pkg</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> path</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">resolve</span><span style="color:#A6ACCD;">(__dirname</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">../packages/</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> pkg)</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// 2）更新根目录和 packages 目录下每个包的 package.json 的版本号</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">updateVersions</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;font-style:italic;">version</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{}</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// 3）实现更新 package.json 版本号的，以及更新依赖包的版本号</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">updatePackage</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;font-style:italic;">pkgRoot</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">version</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{}</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// 4）实现更新与 vue 相关依赖包的版本号</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">updateDeps</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;font-style:italic;">pkg</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">depType</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">version</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{}</span></span>
<span class="line"></span></code></pre></div><ol start="4"><li>打包编译所有包</li></ol><p>这部分涉及另外一个文件 script/build.js，这个文件主要是将各个包打包在对应的目录下，比如打包一个依赖就运行一次<code>yarn build</code>，如果有多个包，就异步循环调用打包命令。核心代码如下：</p><div class="language-javascript"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">/**</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> * 迭代打包</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> * </span><span style="color:#89DDFF;font-style:italic;">@</span><span style="color:#C792EA;font-style:italic;">param</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#89DDFF;font-style:italic;">{</span><span style="color:#FFCB6B;font-style:italic;">*</span><span style="color:#89DDFF;font-style:italic;">}</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#A6ACCD;font-style:italic;">maxConcurrency</span><span style="color:#676E95;font-style:italic;"> 最大并发</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> * </span><span style="color:#89DDFF;font-style:italic;">@</span><span style="color:#C792EA;font-style:italic;">param</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#89DDFF;font-style:italic;">{</span><span style="color:#FFCB6B;font-style:italic;">*</span><span style="color:#89DDFF;font-style:italic;">}</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#A6ACCD;font-style:italic;">source</span><span style="color:#676E95;font-style:italic;"> 目录</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> * </span><span style="color:#89DDFF;font-style:italic;">@</span><span style="color:#C792EA;font-style:italic;">param</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#89DDFF;font-style:italic;">{</span><span style="color:#FFCB6B;font-style:italic;">*</span><span style="color:#89DDFF;font-style:italic;">}</span><span style="color:#676E95;font-style:italic;"> </span><span style="color:#A6ACCD;font-style:italic;">iteratorFn</span><span style="color:#676E95;font-style:italic;"> 构建函数（核心就是运行 build 命令）</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> * </span><span style="color:#89DDFF;font-style:italic;">@</span><span style="color:#C792EA;font-style:italic;">returns</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"> */</span></span>
<span class="line"><span style="color:#C792EA;">async</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">runParallel</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;font-style:italic;">maxConcurrency</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">source</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">iteratorFn</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">ret</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> []</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">executing</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> []</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;font-style:italic;">for</span><span style="color:#F07178;"> (</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">item</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">of</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">source</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">p</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FFCB6B;">Promise</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">resolve</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">then</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">iteratorFn</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">item</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">source</span><span style="color:#F07178;">))</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">ret</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">p</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">maxConcurrency</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&lt;=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">source</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">e</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">p</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">then</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">executing</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">splice</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">executing</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">indexOf</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">e</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">1</span><span style="color:#F07178;">))</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">executing</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">e</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">executing</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&gt;=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">maxConcurrency</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;font-style:italic;">await</span><span style="color:#F07178;"> </span><span style="color:#FFCB6B;">Promise</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">race</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">executing</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#F07178;"> </span><span style="color:#FFCB6B;">Promise</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">all</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">ret</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><ol start="5"><li>生成 CHANGELOG 文件</li></ol><p>主要运行的是这行命令：conventional-changelog -p angular -i <a href="http://CHANGELOG.md" target="_blank" rel="noreferrer">CHANGELOG.md</a> -s</p><ol start="6"><li>提交代码</li></ol><p>先执行 git diff 命令，检查文件是否有修改，如果有，执行 git add 和 git commit 命令</p><ol start="7"><li>发布包</li></ol><p>最后执行的命令是，yarn publish，发布新版本和打 Tag</p><ol start="8"><li>推送到 GitHub</li></ol><p>主要运行的命令：</p>`,39),D=s("ul",null,[s("li",null,[s("ul",null,[s("li",{version:""},"打 tag：git tag $"),s("li",{version:""},"推送 tag：git push origin refs/tags/$")])]),s("li",null,[s("ul",null,[s("li",null,"提交代码到远程仓库：git push")])])],-1),F=n('<p>至此，release 发布流程已经分析完了。</p><p><img src="https://cdn.nlark.com/yuque/0/2021/jpeg/1105483/1629654601778-17189d93-a9ad-447f-9ea0-70499c538a0e.jpeg" alt="release 发布流程"></p><h2 id="_4-感想" tabindex="-1">4. 感想 <a class="header-anchor" href="#_4-感想" aria-hidden="true">#</a></h2><p>回答一下开篇的问题，Vue 是如何管理版本号呢？阅读完源码我们会分现，在发版的时候会<strong>统一更新所有包的 package.json 的版本号</strong>。对比我在搭建组件库过程中使用的 lerna，其实 lerna 是把 release 这一套流程封装成了一个包，它里面处理发包的流程跟 Vue Release 流程基本是一致的。</p><p>这次的源码解读解答了我的一些疑惑。在我搭建组件库的过程中，我一开始了解到的是一个组件一个目录，单包推送到 npm 私库。这样做的缺点很明显，需要在每个目录安装一遍依赖，单独处理版本号。后来了解到了 yarn workspace，知道它可以处理依赖安装的问题，但版本号的处理还是没有解决方案。于是我去寻找业内比较流行的解决办法，发现大部分是使用了 lerna。</p><p>于是我向我的 TL 沟通询问，可否采用 yarn + lerna 的方式来搭建组件库。我记得特别清楚他反问我，问我 lerna 解决了什么问题，我支支吾吾回答了官网上的介绍，因为我当时对 lerna 的了解仅停留在官网以及它的常用命令，实际上我不知道它解决了什么问题。TL 见我答不上来，回复了我一句【如无必要，勿增实体】。</p><p>通过这次的源码阅读，我可以回答 TL 反问我的那个问题了，lerna 解决的是发包流程中版本号处理，自动生成 CHANGELOG 文件，提交代码，发布包，推送到仓库这几个问题，它把这几个流程封装成命令供用户使用。它不是搭建组件库非必要引入的工具，虽然引用了 lerna 会增加了新的复杂度，但在不了解发包流程的前期使用 lerna 可以使组件库开发者更专注于组件开发的工作上，而不需要过度关注如何发包。</p><h2 id="_5-实践" tabindex="-1">5. 实践 <a class="header-anchor" href="#_5-实践" aria-hidden="true">#</a></h2><p>经过一番思考，我认为引入 lerna 确实给系统增加了一些复杂度，因为它要求开发人员额外学习 lerna 的一些知识和命令，增加了学习成本以及系统复杂度。我觉得可以参考 Vue 的 release.js，写一个适用于项目的构建发版脚本用来发包，降低系统复杂度。</p><p>逻辑代码基本与 Vue3 的 release.js 和 build.js 一致，去掉了一些没必要的代码，比如单元测试和一些环境判断。还修改了一下 rollup.config.js 的配置，感觉用起来确实比 lerna 好用一些。最终效果如下：</p><p><img src="'+c+'" alt=""></p>',11);function i(A,C,u,d,g,f){const a=t("Comment");return e(),p("div",null,[y,D,F,o(a)])}const E=l(r,[["render",i]]);export{m as __pageData,E as default};