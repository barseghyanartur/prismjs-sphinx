/**
 * Sphinx `:download:` directive integration with PrismJS.
 *
 * Install the snippet by adding it to the sphinx conf.py configuration
 * as shown below:
 *
 *   prismjs_base = "//cdnjs.cloudflare.com/ajax/libs/prism/1.29.0"
 *
 *   html_css_files = [
 *       f"{prismjs_base}/themes/prism.min.css",
 *       f"{prismjs_base}/plugins/toolbar/prism-toolbar.min.css",
 *       "https://cdn.jsdelivr.net/gh/barseghyanartur/prismjs-sphinx/src/css/sphinx_rtd_theme.css",
 *   ]
 *
 *   html_js_files = [
 *       f"{prismjs_base}/prism.min.js",
 *       f"{prismjs_base}/plugins/autoloader/prism-autoloader.min.js",
 *       f"{prismjs_base}/plugins/toolbar/prism-toolbar.min.js",
 *       f"{prismjs_base}/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js",
 *       "https://cdn.jsdelivr.net/gh/barseghyanartur/prismjs-sphinx/src/js/download_adapter.js",
 *   ]
 *
 * @author Artur Barseghyan (https://github.com/barseghyanartur)
 * @url https://github.com/barseghyanartur/prismjs-sphinx
 * @version 1.2.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all download links by their class
    let downloadLinks = document.querySelectorAll('.prismjs-sphinx-download a.reference.download.internal');

    downloadLinks.forEach(function(link, index) {
        // Create a unique id for the additional content div
        let contentID = 'additional-content-' + index;

        // Get the file extension and set language class
        let fileExtension = link.getAttribute('href').split('.').pop();
        let langClass = fileExtension === 'py' ? 'language-python' :
                        fileExtension === 'js' ? 'language-javascript' :
                        'language-plaintext';

        // Create a new div for the additional content
        let additionalContentDiv = document.createElement('div');
        additionalContentDiv.id = contentID;
        additionalContentDiv.style.display = 'none';

        // Create pre and code elements for syntax highlighting
        let preElement = document.createElement('pre');
        let codeElement = document.createElement('code');
        codeElement.classList.add(langClass);
        preElement.appendChild(codeElement);
        additionalContentDiv.appendChild(preElement);

        // Insert the additional content div after the link
        link.parentNode.insertBefore(additionalContentDiv, link.nextSibling);

        // Attach a click event to the download link
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the link from being followed
            let additionalContent = document.getElementById(contentID).querySelector('code');

            if (additionalContentDiv.style.display === 'block') {
                additionalContentDiv.style.display = 'none';
            } else {
                // Check if content has been fetched
                if (!additionalContentDiv.classList.contains('fetched')) {
                    let retries = 3;
                    let url = link.getAttribute('href');
                    function fetchContent() {
                        // Fetch the content of the file and display it
                        let xhr = new XMLHttpRequest();
                        xhr.open('GET', url, true);
                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    additionalContent.textContent = xhr.responseText;
                                    Prism.highlightElement(additionalContent);
                                    additionalContentDiv.style.display = 'block';
                                    // Add fetched class
                                    additionalContentDiv.classList.add('fetched');
                                } else {
                                    additionalContent.textContent = 'Error fetching content.';
                                    additionalContentDiv.style.display = 'block';
                                }
                            }
                        };
                        xhr.send();
                    }
                    fetchContent();
                } else {
                    // Content has been fetched, just show it
                    additionalContentDiv.style.display = 'block';
                }
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Check if the HTML is under the 'prismjs-sphinx-toggle-emphasis' class
    const container = document.querySelector('.prismjs-sphinx-toggle-emphasis');

    if (container) {
        // Function to create a new div.highlight element with content from 'span.hll' elements
        function createNewCodeBlock(originalCodeBlock) {
            const spanElements = originalCodeBlock.querySelectorAll('span.hll');
            const newCodeBlock = document.createElement('div');
            newCodeBlock.classList.add('highlight');

            // Create a new pre element to hold the 'span.hll' elements
            const newPreElement = document.createElement('pre');

            spanElements.forEach((span) => {
                // Clone the 'span' element and its content
                const spanClone = span.cloneNode(true);
                newPreElement.appendChild(spanClone);
            });

            newCodeBlock.appendChild(newPreElement);
            return newCodeBlock;
        }

        // Function to toggle visibility of code blocks
        function toggleCodeBlocks(codeBlock1, codeBlock2, toggleButton) {
            const showAllBlocks = toggleButton.textContent === 'Show All Lines';

            if (showAllBlocks) {
                codeBlock1.style.display = 'none';
                codeBlock2.style.display = '';
            } else {
                codeBlock1.style.display = '';
                codeBlock2.style.display = 'none';
            }

            toggleButton.textContent = showAllBlocks ? 'Show Only Emphasized Lines' : 'Show All Lines';
        }

        // Add toggle buttons and create a new div.highlight element for each code block
        const codeBlocks = container.querySelectorAll('.highlight-python');

        codeBlocks.forEach((originalCodeBlock) => {
            // Create a new div.highlight element with content from 'span.hll' elements
            const newCodeBlock = createNewCodeBlock(originalCodeBlock);

            // Hide the original code block and show the new one
            originalCodeBlock.style.display = 'none';

            // Create a button element
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Show Only Emphasized Lines';
            toggleButton.addEventListener('click', () => {
                toggleCodeBlocks(originalCodeBlock, newCodeBlock, toggleButton);
            });

            // Insert the button and the new code block as siblings
            originalCodeBlock.parentNode.insertBefore(toggleButton, originalCodeBlock.nextSibling);
            originalCodeBlock.parentNode.insertBefore(newCodeBlock, originalCodeBlock.nextSibling);
        });
    }
});
