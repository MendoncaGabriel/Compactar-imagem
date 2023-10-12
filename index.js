let levelCompact = 1
let fileName = ''
let weightOriginal = 0
let weightCompact = 0
let percentage = 0

document.getElementById('compressBtn').addEventListener('click', function() {
    var inputFile = document.getElementById('inputFile').files[0];
    if (inputFile) {
        //obter nome do arquivo
        fileName = inputFile.name


        // Obtendo o tamanho do arquivo original em KB
        var originalSizeInKB = inputFile.size / 1024;
        console.log('Tamanho do arquivo original: ' + originalSizeInKB.toFixed(2) + ' KB');
        weightOriginal = originalSizeInKB


        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                var maxWidth = 800; // Largura máxima permitida
                var maxHeight = 600; // Altura máxima permitida
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(function(blob) {
                    // Obtendo o tamanho do blob em KB
                    var fileSizeInKB = blob.size / 1024; // tamanho em KB
                    console.log('Tamanho da imagem comprimida: ' + fileSizeInKB.toFixed(2) + ' KB');
                    weightCompact = fileSizeInKB


                    //porgentagem de compactação
                    percentage = ((weightOriginal - weightCompact) / weightOriginal) * 100;
                    console.log('Compactação: ' + percentage.toFixed(2) + ' %');

                    //download da imagem compactada
                    var downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = fileName;
                    downloadLink.click();
                }, 'image/jpeg', levelCompact);
            };
        };
        reader.readAsDataURL(inputFile);


    } else {
        alert('Selecione um arquivo de imagem.');
    }
});