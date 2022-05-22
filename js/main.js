$(document).ready(function() {

	$(".custom-file-input").change(function() {
		let path = $(this).val();
		let nombre_archivo = path.split(/(\/|\\)/i).pop() || "Seleccione archivo";

		$(".custom-file-label").text(nombre_archivo);
	});

	$('#formulario').submit(function() {
		$("#status").empty().text("File is uploading...");
		$(this).ajaxSubmit({

			error: function(xhr) {
				$("#status").empty().text('Error: ' + xhr.status);
			},

			success: function(response) {
				$("#status").empty().text(response.data);

				if (response.status) {
					$("#imgIpfs").removeAttr("src");
					$("#urlIpfs").removeAttr("href");

					if (response.image) {
						$("#imgIpfs").attr('src', response.urlIpfs);
					} else {
						$("#imgIpfs").attr('src', 'img/Not-Image.png');
					}

					$("#urlIpfs").attr('href', response.urlIpfs);
					$("#txtBuffer").val(response.bufferContent);
				} else {
					$("#status").empty().text('Error Upload File');
				}

				$('#formulario')[0].reset();
				$(".custom-file-label").text("Seleccione archivo");
				console.log(response);
			}
		});

		return false;
	});  

});