#!/bin/bash

# $1 arg1 = extDir extensions/porndetection@nuarlyss.wordpress.com/ 
# $2 arg2 = imgDir tempat original image yg akan di cek
#
# semua isi program porndetect ada di defaults/bin/ tapi file pendukung ada di defaults/etc/

pornprog=$1"/defaults/bin/porndetection"
cascade=$1"/defaults/etc/testporn18.xml"
noporn=$1"/defaults/etc/noporn.png"
con="/usr/bin/convert"

rm -Rf $2/checked

mkdir $2/checked

X=0

for i in `ls $2 | grep -v checked`
do
	#echo $pornprog $cascade $2/$i

	hasil=`$pornprog --cascade=$cascade $2/$i | awk '{ print $5 }'`
 	
	if [ $hasil -gt 0 ] 
	then
		$con $noporn $2/$i
		X=$((X+1))
	fi
      	
	mv $2/$i $2/checked/$i
done

echo $X > /tmp/pornchecked


