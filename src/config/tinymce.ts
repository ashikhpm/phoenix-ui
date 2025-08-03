// TinyMCE Configuration
// Get your free API key from: https://www.tiny.cloud/auth/signup/
// Then replace the placeholder below with your actual API key

export const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY || 'w66t3z6lish5u9jiwsqcbwev1sw34nou1i4dpn0fwjmciefl';

// TinyMCE Editor Configuration
export const TINYMCE_CONFIG = {
  height: 400,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
}; 