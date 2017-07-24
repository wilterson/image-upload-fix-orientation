$(".image-uploader").on("change", function ()
{
    var input = $(this);
    
    var imgContainer = $(input).siblings('.dropify-preview');

    var files = !!this.files ? this.files : [];

    if (!files.length || !window.FileReader)
        return;

    if (/^image/.test(files[0].type)) { // pega somente image
        var reader = new FileReader();
        reader.readAsDataURL(files[0]); // pega a image local

        reader.onloadend = function () { // coloca img na preview

        };

        getOrientation(files[0], function(orientation) { // arruma a orientação da img na preview
            var degree = 0;
            switch (orientation) {
                case 3:
                    degree = 180;
                    break;
                case 6:
                    degree = 90;
                    break;
                case 8:
                    degree = 270;
                    break;
            }
            $(imgContainer).css('transform', 'rotate('+ degree +'deg)');
            $(imgContainer).children('.dropify-infos').css('transform', 'rotate(-'+ degree +'deg)');
        });
    }
});

//Retorna a EXIF da imagem no upload
function getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {

        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file);
}