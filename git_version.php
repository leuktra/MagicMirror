<?php

$git_version = array(
	'hash'	=> trim( `git rev-parse HEAD` )
);
echo json_encode( $git_version );