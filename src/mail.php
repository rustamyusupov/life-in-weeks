<!doctype html>
<html lang="ru">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Сообщение с сайта</title>
</head>
<body>
<?php

$name = htmlspecialchars($_POST['name']);
$contact = htmlspecialchars($_POST['contact']);

$to  = 'info@.ru';
$subject = 'Обратный звонок';

$message = '
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Обратный звонок</title>
</head>
<body>

  <table style="width: 100%;">
    <tr>
      <td style="width: 10%; white-space: nowrap; padding: 10px 5px 5px 15px;"><b>Имя:</b></td>
      <td style="padding: 10px 5px 5px 5px;">'.$name.'</td>
    </tr>
    <tr>
      <td style="width: 10%; white-space: nowrap; padding: 10px 5px 5px 15px;"><b>Контакт:</b></td>
      <td style="padding: 10px 5px 5px 5px;">'.$contact.'</td>
    </tr>
  </table>

</body>
</html>
';

$headers  = 'MIME-Version: 1.0' . "rn";
$headers .= 'Content-type: text/html; charset=utf-8' . "rn";
$headers .= 'From: ' . "rn";

mail($to, $subject, $message, $headers)

?>

</body>
</html>
