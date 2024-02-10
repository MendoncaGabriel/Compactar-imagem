let levelCompact = 1
let fileName = ''
let weightOriginal = 0
let weightCompact = 0
let percentage = 0
let imagens = []

function Comprimir() {
    try {        
        let inputFiles = document.getElementById('fileInput').files;
    
        if (inputFiles.length > 0) {
            for (let i = 0; i < inputFiles.length; i++) {
                let inputFile = inputFiles[i];
    
                //obter nome do arquivo
                fileName = inputFile.name
    
                // Obtendo o tamanho do arquivo original em KB
                SizeFile(inputFile)
    
                Render(inputFiles[i])
            
            }
        } else {
            alert('Selecione um arquivo de imagem.');
        }
    } catch (error) {
        console.log('Erro ao comprimir imagem')
    }
}

function Render(inputFiles){
    try{
        let reader = new FileReader();
        reader.onload = function(event) {
            let img = new Image();
            img.src = event.target.result;
    
            img.onload = function() {
                let maxWidth = 800; // Largura máxima permitida
                let maxHeight = 600; // Altura máxima permitida
                let width = img.width;
                let height = img.height;
    
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
    
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
    
                canvas.toBlob(function(blob) {
                    // Obtendo o tamanho do blob em KB
                    let fileSizeInKB = blob.size / 1024; // tamanho em KB
                    weightCompact = fileSizeInKB
                    
                    
                    //porgentagem de compactação
                    percentage = ((weightOriginal - weightCompact) / weightOriginal) * 100;
                    
                    // Adicionando a imagem compactada ao array
                    imagens.push(blob)
                    
                    console.log('Tamanho da imagem comprimida: ' + fileSizeInKB.toFixed(2) + ' KB');
                    console.log('Compactação: ' + percentage.toFixed(2) + ' %');
                    ListarLi(inputFiles, `${fileSizeInKB.toFixed(2)} KB`, `${percentage.toFixed(2)} %`, blob)
        
                }, 'image/jpeg', levelCompact);
            };
        };
        reader.readAsDataURL(inputFiles);
       
    }
    catch(erro){
        console.log('Erro ao renderizar imagem')
    }

}
function Download(){
    try{
        if(imagens.length > 0){

            imagens.forEach((e)=>{
                let downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(e);
                downloadLink.download = fileName;
                downloadLink.click();
    
            })
        }else{
            alert('Sem imagens a serem compactadas, por favor faça UPLOAD!')
        }
    }catch(erro){
        console.log('Erro ao fazer download')
    }
}
function downloadOne(url) {
    try {
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = "nome_do_arquivo";  // Substitua "nome_do_arquivo" pelo nome desejado
        downloadLink.click();
    } catch (erro) {
        console.log('Erro ao fazer download');
    }
}


function SizeFile(inputFile){
    try {
        let originalSizeInKB = inputFile.size / 1024;
        console.log('Tamanho do arquivo original: ' + originalSizeInKB.toFixed(2) + ' KB');
        weightOriginal = originalSizeInKB
        return `${originalSizeInKB.toFixed(2)} KB`
    } catch (error) {
        console.log('Erro na função SizeFile')
    }
}
function ListarLi(inputFile, sizeCompact, porcentagem, blob){
    document.getElementById('texttInfo').classList.remove('hidden')
    let listaImagens = document.getElementById('listaImagens')
    listaImagens.innerHTML += `
    <li class="list-none border  rounded-md shadow-md bg-gray-50 relative  w-full overflow-hidden">
        <div class="flex items-center ">
            <img class="w-32 md:mr-5 mr-2 aspect-square object-cover" src="${URL.createObjectURL(blob)}" >
            <p class="">
                <b>NOME</b>: ${inputFile.name} <br> <b> ANTES</b>: ${SizeFile(inputFile)}  <br> <b> DEPOIS</b>: ${sizeCompact}  <br> <b> NIVEL</b>: ${porcentagem} 
            </p>
        </div>

        <div class=" border bg-gray-100 p-2 w-full h-auto items-center justify-end flex space-x-2">

            <button class="bg-blue-600 hover:bg-blue-500 hover:shadow-md px-4 py-2 rounded-md text-white  " onclick="downloadOne('${URL.createObjectURL(blob)}')">
                Download
            </button>
            <button class="bg-red-600 hover:bg-red-500 hover:shadow-md px-4 py-2 rounded-md text-white  " onclick="removeItem(this)">
                Remover
            </button>
        </div>
    </li>`


}


document.getElementById('fileInput').addEventListener('change', ()=>{
    Comprimir()
    document.getElementById('compressBtn').classList.remove('hidden')
})


function removeItem(button) {
    // Obtém o elemento li pai do botão clicado
    var listItem = button.closest('li');

    // Remove o elemento li
    listItem.remove();
}