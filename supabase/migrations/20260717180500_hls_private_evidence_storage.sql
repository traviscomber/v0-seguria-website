update storage.buckets
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/webp',
    'application/vnd.apple.mpegurl',
    'application/x-mpegURL',
    'video/mp2t'
  ]
where id = 'seguria-evidence';
