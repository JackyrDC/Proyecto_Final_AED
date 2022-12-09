<?php include_once("index.html"); 

$queryString = http_build_query([
  'access_key' => 'ACCESS_KEY',
  'keywords' => 'Wall street -wolf', // the word "wolf" will be
  'categories' => '-entertainment',
  'sort' => 'popularity',
]);

$ch = curl_init(sprintf('%s?%s', 'https://api.mediastack.com/v1/news', $queryString));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$json = curl_exec($ch);

curl_close($ch);

$apiResult = json_decode($json, true);

print_r($apiResult);

?>