package com.musicplayer.web.rest;

import com.musicplayer.security.AuthoritiesConstants;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class FileUploadResource {

    private static final Logger LOG = LoggerFactory.getLogger(FileUploadResource.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/image")
    @PreAuthorize(
        "hasAnyAuthority(\"" +
            AuthoritiesConstants.ADMIN +
            "\", \"" +
            AuthoritiesConstants.EDITOR +
            "\", \"" +
            AuthoritiesConstants.ARTIST +
            "\", \"" +
            AuthoritiesConstants.USER +
            "\")"
    )
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten imágenes"));
            }

            Path uploadPath = Path.of(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String extension =
                file.getOriginalFilename() != null
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + filename;
            LOG.debug("Imagen guardada: {}", url);

            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            LOG.error("Error al guardar imagen", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al guardar la imagen"));
        }
    }

    @PostMapping("/audio")
    @PreAuthorize(
        "hasAnyAuthority(\"" +
            AuthoritiesConstants.ADMIN +
            "\", \"" +
            AuthoritiesConstants.EDITOR +
            "\", \"" +
            AuthoritiesConstants.ARTIST +
            "\")"
    )
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten archivos de audio"));
            }

            Path uploadPath = Path.of(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String extension =
                file.getOriginalFilename() != null
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                    : ".mp3";
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + filename;
            LOG.debug("Audio guardado: {}", url);

            return ResponseEntity.ok(Map.of("url", url, "filename", filename));
        } catch (IOException e) {
            LOG.error("Error al guardar audio", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al guardar el audio"));
        }
    }

    @GetMapping("/stream/{filename}")
    public ResponseEntity<Resource> streamAudio(@PathVariable String filename) throws IOException {
        Path uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
        Path filePath = uploadPath.resolve(filename).normalize();

        LOG.debug("Stream request — uploadPath={} filePath={} exists={}", uploadPath, filePath, Files.exists(filePath));

        // Seguridad: prevenir path traversal
        if (!filePath.startsWith(uploadPath)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);

        if (contentType == null) {
            contentType = "audio/mpeg";
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
            .body(resource);
    }
}
