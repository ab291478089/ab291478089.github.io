#!/usr/bin/env node

/**
 * Markdown to HTML Converter for Hexo Annie Theme
 * 将Markdown文件转换为符合Hexo Annie主题样式的HTML
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 配置marked
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

/**
 * 从Markdown文件提取元数据
 */
function extractMetadata(content) {
  const metadata = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    categories: [],
  };

  // 提取标题（第一个 # 开头的行）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1];
  }

  // 提取日期（从文件名或内容中）
  const dateMatch = content.match(/date:\s*(.+)/i);
  if (dateMatch) {
    metadata.date = dateMatch[1].trim();
  }

  // 提取标签
  const tagsMatch = content.match(/tags:\s*\[(.+)\]/i);
  if (tagsMatch) {
    metadata.tags = tagsMatch[1].split(',').map(t => t.trim());
  }

  // 提取分类
  const categoriesMatch = content.match(/categories:\s*\[(.+)\]/i);
  if (categoriesMatch) {
    metadata.categories = categoriesMatch[1].split(',').map(c => c.trim());
  }

  return metadata;
}

/**
 * 生成文章页面HTML
 */
function generateArticleHTML(metadata, content, articlePath) {
  // 移除元数据行，只保留正文内容
  const contentWithoutMeta = content
    .replace(/^#\s+.+$/m, '') // 移除标题
    .replace(/^date:\s*.+$/im, '') // 移除日期
    .replace(/^tags:\s*\[.+\]$/im, '') // 移除标签
    .replace(/^categories:\s*\[.+\]$/im, '') // 移除分类
    .trim();
  
  const htmlContent = marked(contentWithoutMeta);
  const dateObj = new Date(metadata.date);
  const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  // 生成相对路径
  const depth = articlePath.split('/').filter(Boolean).length;
  const rootPath = '../'.repeat(depth);

  return `<!DOCTYPE html>
<html class="html-loading">
<head><meta name="generator" content="Hexo 3.8.0">
	<meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <title>
    ${metadata.title} | lx_blogs
  </title>
  <meta name="author" content="lx_blogs">
  <meta name="keywords" content="${metadata.tags.join(',')}">
  <meta name="description" content="${metadata.title}">
	<link rel="shortcut icon" href="${rootPath}img/favicon.ico">
  <link rel="stylesheet" href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="${rootPath}css/Annie.css">
  <script src="${rootPath}js/jquery.min.js"></script>
  <script src="https://cdn1.lncld.net/static/js/av-core-mini-0.6.4.js"></script>
<script src="${rootPath}js/leancloud.js"></script>
</head>
	<body>
		<div id="preloader">
		<div class="pre-container">
			<div class="spinner">
				<div class="double-bounce1"></div>
				<div class="double-bounce2"></div>
			</div>			
		</div>
	</div>

<header class="fixbackground" data-img-mode="normal" data-normal-src="${rootPath}img/1.jpg" data-random-max="110" data-random-src="https://sariay.github.io/Random-img/">
	<div class="mask">
		<div class="h-header">
			<div id="logo">
				<a href="${rootPath}">
					<img src="${rootPath}img/logo.png" alt="Logo">
				</a>
			</div>
			<div id="navigation-show">
				<ul>
		<li class="menu-home"><a href="${rootPath}" class="menu-item-home">主页</a></li>
		<li class="menu-archive"><a href="${rootPath}archives" class="menu-item-archive">归档</a></li>
		<li class="menu-categories"><a href="${rootPath}categories" class="menu-item-categories">分类</a></li>
		<li class="menu-tags"><a href="${rootPath}tags" class="menu-item-tags">标签</a></li>
		<li class="menu-about"><a href="${rootPath}about" class="menu-item-about">关于</a></li>
		<li class="menu-gallery"><a href="${rootPath}gallery" class="menu-item-gallery">相册</a></li>
</ul>
			</div>				
		</div>
		<div class="h-body"><p class="motto"></p></div>		
		<div class="h-footer">
			<a href="javascript:;" id="read-more"><i class="fa fa-angle-double-down" aria-hidden="true"></i></a>
		</div>
	</div>
</header>

<div id="navigation-hide">
	<div id="progress-bar"></div>
	<div id="progress-percentage"><h1>0.0%</h1></div>
	<div class="toc-switch"><span class="switch-button">目录</span></div>
	<p>当前文章&nbsp;:&nbsp;《${metadata.title}》</p>
	<a class="nav-trigger"><span></span></a>
</div>

<nav class="nav-container" id="cd-nav">
	<div class="nav-header">
		<h3>Navigation</h3>
		<a href="javascript:;" class="nav-close"></a>
	</div>
	<div class="nav-body">
		<ul>
		<li class="menu-home"><a href="${rootPath}" class="menu-item-home">主页</a></li>
		<li class="menu-archive"><a href="${rootPath}archives" class="menu-item-archive">归档</a></li>
		<li class="menu-categories"><a href="${rootPath}categories" class="menu-item-categories">分类</a></li>
		<li class="menu-tags"><a href="${rootPath}tags" class="menu-item-tags">标签</a></li>
		<li class="menu-about"><a href="${rootPath}about" class="menu-item-about">关于</a></li>
		<li class="menu-gallery"><a href="${rootPath}gallery" class="menu-item-gallery">相册</a></li>
</ul>
	</div>
	<div class="nav-footer">
		<ul>
		<li><a href="http://github.com/" target="_blank"><i class="fa fa-github"></i></a></li>
		<li><a href="${rootPath}atom.xml" target="_blank"><i class="fa fa-rss"></i></a></li>			
</ul>
	</div>
</nav>
		<main>
			<div class="layout-post">
				<div id="layout-post">
					<div class="article-title">
						<i class="fa fa-paper-plane-o" aria-hidden="true"></i>
						<a href="${articlePath}" itemprop="url">
							${metadata.title}
						</a>
					</div>

					<div class="article-meta">
						<span>
							<i class="fa fa-calendar"></i>
							发布于
							<a href="${articlePath}" itemprop="url">
								<time datetime="${dateObj.toISOString()}" itemprop="datePublished">
									${formattedDate}
								</time>
							</a>
						</span>
						<span>
							<i class="fa fa-tags"></i>
							${metadata.tags.map(tag => `<a href="${rootPath}tags/#${tag}" rel="tag">${tag}</a>`).join(', ')}
						</span>
					</div>

					<div class="article-content" id="article-content">
						${htmlContent}
					</div>
					
					<div id="current-post-cover" data-scr="${rootPath}img/cart_cover.jpg"></div>

					<div class="investment-container">
						<div class="investment-header">
							<div class="investment-title-1">
								<div class="on">相关文章</div>
								<div>评论</div>
								<div>分享</div>
							</div>
							<div class="investment-title-2">	            
								<span>
									<a href="javascript: window.scrollTo(0, 0);">返回顶部</a>
								</span>
							</div>	
						</div>
						
						<div class="investment-content">
							<div class="investment-content-list">
								<div class="relate-post">
									<ul>
										<li>
											<div class="relate-post-text">
												<p class="relate-post-content">
													暂无相关文章
												</p>
											</div>
										</li>											
									</ul>
								</div>	
							</div>
							<div class="investment-content-list">
								<div class="layout-comment">
									<div>Please check the comment setting in config.yml of hexo-theme-Annie!</div>
								</div>
							</div>
							<div class="investment-content-list">
								<div class="layout-share">
									<div class="social-share"></div>
									<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/social-share.js/1.0.16/css/share.min.css">
									<script async src="https://cdnjs.cloudflare.com/ajax/libs/social-share.js/1.0.16/js/social-share.min.js"></script>
								</div>
							</div>
						</div>	
					</div>
				</div>
			</div>

			<script src="${rootPath}plugin/clipboard/clipboard.js"></script>
			<script>
				function codePreprocessing() {
					$("#article-content .highlight").each(function() {
						$(this).wrap('<div id="post-code"></div>');
					})

					$("#article-content #post-code").each(function() {
						$(this).prepend('<nav class="copy-nav"><span><i class="code-language"></i></span></nav>');
					})

					$("#article-content .copy-nav").each(function() {
						var temp = $(this).next().attr('class'),
							language = ((temp.length > 9) && (temp != null)) ? temp.substr(10) : "none";
						$(this).find('.code-language').text(language);
						$(this).append('<span class="copy-btn"><i class="fa fa-copy" aria-hidden="true"></i></span>');
					});
				}

				function codeCopy() {
					$('#article-content #post-code').each(function(i) {
						var codeCopyId = 'codeCopy-' + i;
						var codeNode = $(this).find('.code'),
							copyButton = $(this).find('.copy-btn');
						codeNode.attr('id', codeCopyId);
						copyButton.attr('data-clipboard-target-id', codeCopyId);
					})

					var clipboard = new ClipboardJS('.copy-btn', {
						target: function(trigger) {
							return document.getElementById(trigger.getAttribute('data-clipboard-target-id'));
						}
					});

					function showTooltip(elem, msg) {		   
						elem.setAttribute('aria-label', msg);
						elem.setAttribute('class', 'copy-btn copy-status');
						setTimeout(function() {
							elem.setAttribute('class', 'copy-btn');
						}, 2000);
					}

					clipboard.on('success', function(e) {
						e.clearSelection();
						showTooltip(e.trigger, 'Copied!');
					});
					clipboard.on('error', function(e) {
						console.error('Action:', e.action);
						console.error('Trigger:', e.trigger);
					});
				}

				if ($('.layout-post').length) {
					codePreprocessing();
					codeCopy();
				} 
			</script>

			<link rel="stylesheet" href="${rootPath}plugin/fancybox/jquery.fancybox.css">
			<script src="${rootPath}plugin/fancybox/jquery.fancybox.js"></script>

			<script type="text/javascript">
				var titleID = $('.article-title a'),
					imageID = $('.article-content img'),
					videoID = $('.article-content video');

				var postTitle = titleID.text() ? titleID.text() : "No post title!";

				imageID.each(function() {
					var imgPath = $(this).attr('src'),
						imgTitle = $(this).attr('alt') ? $(this).attr('alt') : "No image description!";
					$(this).wrap('<a data-fancybox="gallery" data-caption=" 《 ' + postTitle + ' 》 ' + imgTitle + ' "  href=" ' + imgPath + ' "> </a>');
				});

				videoID.each(function() {
					var videoPath = $(this).attr('src');
					$(this).wrap('<a data-fancybox href=" ' + videoPath + ' "> </a>');
				});

				if($('#layout-post').length) {
					$('[data-fancybox="gallery"]').fancybox({
						loop: true,
						buttons: [
							"zoom",
							"share",
							"slideShow",
							"fullScreen",
							"thumbs",
							"close"
						],
						protect: false
					});
				}
			</script>
		</main>

		<footer>
			<div class="social">
				<ul>
					<li><a href="http://github.com/" target="_blank"><i class="fa fa-github"></i></a></li>
					<li><a href="http://github.com/" target="_blank"><i class="fa fa-weibo"></i></a></li>
					<li><a href="http://github.com/" target="_blank"><i class="fa fa-pinterest"></i></a></li>
					<li><a href="http://github.com/" target="_blank"><i class="fa fa-instagram"></i></a></li>
					<li><a href="http://github.com/" target="_blank"><i class="fa fa-twitter"></i></a></li>
					<li><a href="${rootPath}atom.xml" target="_blank"><i class="fa fa-rss"></i></a></li>			
				</ul>
			</div>		
			<div class="copyright">
				<p>
					&copy;2017 - 2026, content by lx_blogs. All Rights Reserved.
					<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>	
					<span id="busuanzi_container_page_pv">
						本文总阅读量<span id="busuanzi_value_page_pv"></span>次
					</span>
				</p>
				<p>
					<a href="http://hexo.io/" title="Hexo" target="_blank" rel="noopener">Hexo</a> Theme <a href="https://github.com/Sariay/hexo-theme-Annie" title="Annie" target="_blank" rel="noopener">Annie</a> by Sariay.
				</p>
			</div>		
		</footer>

		<script src="${rootPath}plugin/motto/motto.js"></script>	
		<script type="text/javascript">$(".motto").html( getMingYanContent() );</script>	
		<script src="${rootPath}plugin/love/love.js"></script>
		<div id="totop"><a href="javascript:;" name="TOTOP" class="fa fa-arrow-up"></a></div>
		<script src="${rootPath}plugin/vibrant/vibrant.js"></script>
		<script src="${rootPath}plugin/chinese/chinese.js"></script>
		<script src="${rootPath}plugin/imgLazyLoader/yall.min.js"></script>
		<script src="${rootPath}plugin/imgResize/jquery.resizeimagetoparent.min.js"></script>
		<script src="${rootPath}plugin/nicescroll/jquery.nicescroll.js"></script>
		<script src="${rootPath}js/resizediv.js"></script>
		<script src="${rootPath}js/main.js"></script>
	</body>	
</html>`;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node md2html.js <markdown文件路径> [输出目录]');
    console.log('');
    console.log('示例:');
    console.log('  node md2html.js article.md');
    console.log('  node md2html.js article.md ./output');
    process.exit(1);
  }

  const mdFile = args[0];
  const outputDir = args[1] || '.';

  if (!fs.existsSync(mdFile)) {
    console.error(`错误: 文件 ${mdFile} 不存在`);
    process.exit(1);
  }

  const content = fs.readFileSync(mdFile, 'utf-8');
  const metadata = extractMetadata(content);

  if (!metadata.title) {
    console.error('错误: Markdown文件必须包含标题（以 # 开头的行）');
    process.exit(1);
  }

  // 生成输出路径
  const dateObj = new Date(metadata.date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  const articleDir = path.join(outputDir, String(year), month, day, metadata.title);
  
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  const outputPath = path.join(articleDir, 'index.html');
  const articlePath = `/${year}/${month}/${day}/${metadata.title}/`;

  const html = generateArticleHTML(metadata, content, articlePath);
  fs.writeFileSync(outputPath, html, 'utf-8');

  console.log(`✓ 成功生成: ${outputPath}`);
  console.log(`  标题: ${metadata.title}`);
  console.log(`  日期: ${metadata.date}`);
  console.log(`  标签: ${metadata.tags.join(', ') || '无'}`);
}

main();
