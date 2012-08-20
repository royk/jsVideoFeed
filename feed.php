<?php
require 'feed/Feed.class.php';
require 'feed/RSS.class.php';
require 'feed/Atom.class.php';

$user      = "poisonta_video";
$password   = "ranchan";
$database   = "poisonta_videofeed";
$connection = mysql_connect('localhost', $user, $password);
@mysql_select_db($database);

$query = "SELECT * FROM videos WHERE deleted=0 ORDER BY id";
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
        }
        $link = "http://footbagisrael.com/videos/?id=".$row["id"];
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
    header('Content-type: application/xml');
    echo $output;
}