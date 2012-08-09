<?php
/**
 * Step 1: Require the Slim PHP 5 Framework
 *
 * If using the default file layout, the `Slim/` directory
 * will already be on your include path. If you move the `Slim/`
 * directory elsewhere, ensure that it is added to your include path
 * or update this file path as needed.
 */
require 'Slim/Slim.php';



/**
 * Step 2: Instantiate the Slim application
 *
 * Here we instantiate the Slim application with its default settings.
 * However, we could also pass a key-value array of settings.
 * Refer to the online documentation for available settings.
 */
$app = new Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, and `Slim::delete`
 * is an anonymous function. If you are using PHP < 5.3, the
 * second argument should be any variable that returns `true` for
 * `is_callable()`. An example GET route for PHP < 5.3 is:
 *
 * $app = new Slim();
 * $app->get('/hello/:name', 'myFunction');
 * function myFunction($name) { echo "Hello, $name"; }
 *
 * The routes below work with PHP >= 5.3.
 */

//GET route
$user      = "poisonta_video";
$password   = "ranchan";
$database   = "poisonta_videofeed";
$connection = mysql_connect('localhost', $user, $password);
@mysql_select_db($database);

// common variables
$cacheFile = "cache/count.dat";

$app->get('/videoOfTheDay', function() use ($cacheFile) {
    
    $fp = @fopen($cacheFile, 'r');
    if ($fp) {
        $str = fread($fp, filesize($cacheFile));
        $cache = json_decode($str);
        fclose($fp);
    }

    $dayNum = date("d") + date("m") + date("y");
    if (isset($cache)) {
        if (!isset($cache->content[0]->videoOfTheDay) || $cache->day!=$dayNum) {
            $idOffset = rand(1, intval($cache->content[0]->count)) - 1;
            $query = "SELECT * FROM videos ORDER BY id DESC LIMIT $idOffset,1";
            $result = mysql_query($query);
            if (!$result){
                die(mysql_error());
            }else{
                $rs = array();
                while ($rs[] = mysql_fetch_assoc($result)){

                }
                $cache->content[0]->videoOfTheDay = $rs;
                $cache->day = $dayNum;
                $fp = fopen($cacheFile, 'w');
                fwrite($fp, json_encode($cache));
                fclose($fp);
                mysql_free_result($result);
            }
        }
        echo json_encode($cache->content[0]->videoOfTheDay);
    }
});

$app->get('/count', function() use ($cacheFile) {
    $fp = @fopen($cacheFile, 'r');
    if ($fp) {
        $str = fread($fp, filesize($cacheFile));
        $countCache = json_decode($str);
        fclose($fp);
    }
    $dayNum = date("d") + date("m") + date("y");
    if (!isset($countCache) || intval($countCache->day)!=$dayNum) {
        $query = "SELECT COUNT(id) FROM videos";
        $result = mysql_query($query);
        if (!$result){
            die(mysql_error());
        }else{
            $rs = array();
            while ($rs[] = mysql_fetch_assoc($result)){

            }
            $countObj[] = array(
                "count" => $rs[0]["COUNT(id)"]
            );  
        }
        $fp = fopen($cacheFile, 'w');
        $countCache = array(
            'day' => $dayNum,
            'content' => $countObj);
        fwrite($fp, json_encode($countCache));
        fclose($fp);
        mysql_free_result($result);

    } else {
        $countObj[] = $countCache->content;
    }

    echo json_encode($countObj);
    

});

$app->get('/getAll', function () {
    $start = $_GET["start"];
    $query = "SELECT SQL_CALC_FOUND_ROWS * FROM videos ORDER BY id DESC LIMIT $start,5";
    $result = mysql_query($query);
    $countResult = mysql_query("SELECT FOUND_ROWS()");
    if (!$result || !$countResult){
        die(mysql_error());
    }else{
        $rs = array();
        while ($rs[] = mysql_fetch_assoc($result)){

        }
        array_pop($rs);
        $resultContent = new stdClass;
        $resultContent->count = mysql_result($countResult, 0);
        $resultContent->result = $rs;
        echo json_encode($resultContent);
    }
    mysql_free_result($result);
    mysql_free_result($countResult);

   
});
$app->get('/feed', function() {
    $query = "SELECT * FROM videos ORDER BY id";
    $result = mysql_query($query);
    if (!$result){
        die(mysql_error());
    }else{
        $myatom = new Atom('The Freestyle Footbag videos feed', 'http://footbagisrael.com/videos/', 'The latest and greatest in freestyle footbag!');
        $feedItems = array();
        while ($row = mysql_fetch_assoc($result)){
            $year = $row["year"];
            if ($year==""){
                $year = "Unknown year";
            }
            $location = $row["location"];
            if ($location==""){
                $location = "Unknown location";
            }
            $players = $row["players"];
            if ($players==""){
                $players = "Unknown players";
            }
            $maker = $row["maker"];
            if ($maker==""){
                $maker = "Unknown maker";
            }            $link = "http://footbagisrael.com/videos/?id=".$row["id"];
            $atomID = "tag:footbagisrael.com,2012-05-07:videos,?id=".$row["id"];
            $date = $row["date"];
            if ($date=="0000-00-00 00:00:00"){
                $date = date(DateTime::ATOM);
                $mysqldate = date('Y-m-d H:i:s');
                $query = "UPDATE videos SET date='$mysqldate' WHERE id='$row[id]'";
                mysql_query($query);
            }else{
                $phpDate = strtotime($date);
                $date = date(DateTime::ATOM, $phpDate);
            
                $feedItems[] = array(
                        'title' => $row["title"],
                        'id' => $atomID,
                        'link'  => $link,
                        'content' => $year . " at " . $location .  ", made by " . $maker . " With " . $players,
                        'updated' => $date
                    );
            }
        }
        $myatom->addItems($feedItems);
        $myatom->generateTags();
        $myatom->setProperty('category', 'sports');
        $myatom->setGenerator('PHP-Feed', '0.1', 'http://github.com/duckson/php-feed');
        $myatom->addAuthor('Roy Klein', 'http://footbagisrael.com', 'contact@footbagisrael.com');
        $myatom->setProperty('rights', 'Copyleft 2012, Nobody');
        $myatom->setContentType('text/plain');
        $output = $myatom->fetch();
        echo $output;
    }
});
// get a specific video
$app->get('/get', function () {
    $query = "SELECT * FROM videos WHERE id='$_GET[id]'";
    $result = mysql_query($query);
    if (!$result){
        die(mysql_error());
    }else{
        $rs = array();
        while ($rs[] = mysql_fetch_assoc($result)){

        }
        array_pop($rs);
        $resultContent = new stdClass;
        $resultContent->count = count($rs);
        $resultContent->result = $rs;
        echo json_encode($resultContent);
    }
    mysql_free_result($result);
});


$app->get('/search', function(){
    $tags = explode(" ", $_GET["tags"]);
    $like = array();
    foreach ($tags as $tag){
        $like[] = "tags LIKE '%$tag%'";
    }
    $start = $_GET["start"];
    $like   = implode(' AND ', $like);
    $like   = $like . " OR title LIKE '%" . $_GET["tags"] . "%'";
    $like   = $like . " OR players LIKE '%" . $_GET["tags"] . "%'";
    $like   = $like . " OR maker LIKE '%" . $_GET["tags"] . "%'";
    $like   = $like . " OR year LIKE '%" . $_GET["tags"] . "%'";
    $like   = $like . " OR location LIKE '%" . $_GET["tags"] . "%'";
    $query  = "SELECT SQL_CALC_FOUND_ROWS * FROM videos WHERE $like LIMIT $start,10";
    $result = mysql_query($query);
    $countResult = mysql_query("SELECT FOUND_ROWS()");
    if (!$result || !$countResult){
        die($like . ' ' . mysql_error());
    }else{
        $rs = array();
        while ($rs[] = mysql_fetch_assoc($result)){

        }
        array_pop($rs);
        $resultContent = new stdClass;
        $resultContent->count = mysql_result($countResult,0);
        $resultContent->result = $rs;
        echo json_encode($resultContent);
    }
    mysql_free_result($result);
    mysql_free_result($countResult);

});

//POST route
$app->post('/addVideo', function() use ($cacheFile) {
    $query = "SELECT * FROM videos WHERE src LIKE '$_POST[id]'";
    $result = mysql_query($query);
    $mysqldate = date('Y-m-d H:i:s');
    if (!$result){
        header('HTTP/1.0 500 Internal Server Error', true, 500);
        die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
    }
    $rowCount = mysql_num_rows($result);
    if ($rowCount==0){
        $query = "INSERT INTO 
        videos (type, src, width, height, title, tags, players, maker, year, location, date) 
        VALUES 
        ('$_POST[source]',  '$_POST[id]',  '500',  '281',  '$_POST[title]',  '$_POST[tags]', '$_POST[players]', '$_POST[maker]', '$_POST[year]', '$_POST[location]', '$mysqldate')";
        if (!mysql_query($query)){
            header('HTTP/1.0 500 Internal Server Error', true, 500);
           die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
        }
    }else{
        header('HTTP/1.0 400 Bad Request', true, 400);
        die(json_encode(array('success'=>false, 'message'=>'Video already exists')));
    }
    // clear video amount cache
    unlink($cacheFile);
    die(json_encode(array('success'=>true, 'message'=>'Video saved')));
});


$app->post('/modify', function () {
    if (isset($_POST["players"])){
        $query = "UPDATE videos SET players='$_POST[players]' WHERE src='$_POST[src]'";
        $result = mysql_query($query);
        if (!$result){
            header('HTTP/1.0 500 Internal Server Error', true, 500);
            die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
        }
    }
    if (isset($_POST["maker"])){
        $query = "UPDATE videos SET maker='$_POST[maker]' WHERE src='$_POST[src]'";
        mysql_query($query);
        $result = mysql_query($query);
        if (!$result){
            header('HTTP/1.0 500 Internal Server Error', true, 500);
            die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
        }
    }
    if (isset($_POST["year"])){
        $query = "UPDATE videos SET year='$_POST[year]' WHERE src='$_POST[src]'";
        mysql_query($query);
        $result = mysql_query($query);
        if (!$result){
            header('HTTP/1.0 500 Internal Server Error', true, 500);
            die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
        }
    }
    if (isset($_POST["location"])){
        $query = "UPDATE videos SET location='$_POST[location]' WHERE src='$_POST[src]'";
        mysql_query($query);
        $result = mysql_query($query);
        if (!$result){
            header('HTTP/1.0 500 Internal Server Error', true, 500);
            die(json_encode(array('success'=>false, 'message'=>'Unknown DB error')));
        }
    }
    die(json_encode(array('success'=>true, 'message'=>'Video modified')));
});

//DELETE route
$app->delete('/delete', function () {

});

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
mysql_close($connection);