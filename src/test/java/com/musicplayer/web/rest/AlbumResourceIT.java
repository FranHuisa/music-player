package com.musicplayer.web.rest;

import static com.musicplayer.domain.AlbumAsserts.*;
import static com.musicplayer.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicplayer.IntegrationTest;
import com.musicplayer.domain.Album;
import com.musicplayer.domain.Artist;
import com.musicplayer.domain.enumeration.AlbumType;
import com.musicplayer.repository.AlbumRepository;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.mapper.AlbumMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AlbumResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AlbumResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_COVER_IMAGE = "AAAAAAAAAA";
    private static final String UPDATED_COVER_IMAGE = "BBBBBBBBBB";

    private static final LocalDateTime DEFAULT_RELEASE_DATE = LocalDateTime.ofEpochSecond(0L, 0, ZoneOffset.UTC);
    private static final LocalDateTime UPDATED_RELEASE_DATE = LocalDateTime.now(ZoneId.systemDefault());

    private static final AlbumType DEFAULT_ALBUM_TYPE = AlbumType.ALBUM;
    private static final AlbumType UPDATED_ALBUM_TYPE = AlbumType.SINGLE;

    private static final String ENTITY_API_URL = "/api/albums";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private AlbumMapper albumMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAlbumMockMvc;

    private Album album;

    private Album insertedAlbum;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Album createEntity(EntityManager em) {
        Album album = new Album()
            .title(DEFAULT_TITLE)
            .coverImage(DEFAULT_COVER_IMAGE)
            .releaseDate(DEFAULT_RELEASE_DATE)
            .albumType(DEFAULT_ALBUM_TYPE);
        // Add required entity
        Artist artist;
        if (TestUtil.findAll(em, Artist.class).isEmpty()) {
            artist = ArtistResourceIT.createEntity();
            em.persist(artist);
            em.flush();
        } else {
            artist = TestUtil.findAll(em, Artist.class).get(0);
        }
        album.setArtist(artist);
        return album;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Album createUpdatedEntity(EntityManager em) {
        Album updatedAlbum = new Album()
            .title(UPDATED_TITLE)
            .coverImage(UPDATED_COVER_IMAGE)
            .releaseDate(UPDATED_RELEASE_DATE)
            .albumType(UPDATED_ALBUM_TYPE);
        // Add required entity
        Artist artist;
        if (TestUtil.findAll(em, Artist.class).isEmpty()) {
            artist = ArtistResourceIT.createUpdatedEntity();
            em.persist(artist);
            em.flush();
        } else {
            artist = TestUtil.findAll(em, Artist.class).get(0);
        }
        updatedAlbum.setArtist(artist);
        return updatedAlbum;
    }

    @BeforeEach
    void initTest() {
        album = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedAlbum != null) {
            albumRepository.delete(insertedAlbum);
            insertedAlbum = null;
        }
    }

    @Test
    @Transactional
    void createAlbum() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);
        var returnedAlbumDTO = om.readValue(
            restAlbumMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AlbumDTO.class
        );

        // Validate the Album in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAlbum = albumMapper.toEntity(returnedAlbumDTO);
        assertAlbumUpdatableFieldsEquals(returnedAlbum, getPersistedAlbum(returnedAlbum));

        insertedAlbum = returnedAlbum;
    }

    @Test
    @Transactional
    void createAlbumWithExistingId() throws Exception {
        // Create the Album with an existing ID
        album.setId(1L);
        AlbumDTO albumDTO = albumMapper.toDto(album);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAlbumMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        album.setTitle(null);

        // Create the Album, which fails.
        AlbumDTO albumDTO = albumMapper.toDto(album);

        restAlbumMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAlbums() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        // Get all the albumList
        restAlbumMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(album.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].coverImage").value(hasItem(DEFAULT_COVER_IMAGE)))
            .andExpect(jsonPath("$.[*].releaseDate").value(hasItem(DEFAULT_RELEASE_DATE.toString())))
            .andExpect(jsonPath("$.[*].albumType").value(hasItem(DEFAULT_ALBUM_TYPE.toString())));
    }

    @Test
    @Transactional
    void getAlbum() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        // Get the album
        restAlbumMockMvc
            .perform(get(ENTITY_API_URL_ID, album.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(album.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.coverImage").value(DEFAULT_COVER_IMAGE))
            .andExpect(jsonPath("$.releaseDate").value(DEFAULT_RELEASE_DATE.toString()))
            .andExpect(jsonPath("$.albumType").value(DEFAULT_ALBUM_TYPE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingAlbum() throws Exception {
        // Get the album
        restAlbumMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAlbum() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the album
        Album updatedAlbum = albumRepository.findById(album.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAlbum are not directly
        // saved in db
        em.detach(updatedAlbum);
        updatedAlbum.title(UPDATED_TITLE).coverImage(UPDATED_COVER_IMAGE).releaseDate(UPDATED_RELEASE_DATE).albumType(UPDATED_ALBUM_TYPE);
        AlbumDTO albumDTO = albumMapper.toDto(updatedAlbum);

        restAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, albumDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO))
            )
            .andExpect(status().isOk());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAlbumToMatchAllProperties(updatedAlbum);
    }

    @Test
    @Transactional
    void putNonExistingAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, albumDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(albumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(albumDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAlbumWithPatch() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the album using partial update
        Album partialUpdatedAlbum = new Album();
        partialUpdatedAlbum.setId(album.getId());

        partialUpdatedAlbum.title(UPDATED_TITLE).coverImage(UPDATED_COVER_IMAGE).albumType(UPDATED_ALBUM_TYPE);

        restAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlbum.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAlbum))
            )
            .andExpect(status().isOk());

        // Validate the Album in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAlbumUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedAlbum, album), getPersistedAlbum(album));
    }

    @Test
    @Transactional
    void fullUpdateAlbumWithPatch() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the album using partial update
        Album partialUpdatedAlbum = new Album();
        partialUpdatedAlbum.setId(album.getId());

        partialUpdatedAlbum
            .title(UPDATED_TITLE)
            .coverImage(UPDATED_COVER_IMAGE)
            .releaseDate(UPDATED_RELEASE_DATE)
            .albumType(UPDATED_ALBUM_TYPE);

        restAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlbum.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAlbum))
            )
            .andExpect(status().isOk());

        // Validate the Album in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAlbumUpdatableFieldsEquals(partialUpdatedAlbum, getPersistedAlbum(partialUpdatedAlbum));
    }

    @Test
    @Transactional
    void patchNonExistingAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, albumDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(albumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(albumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        album.setId(longCount.incrementAndGet());

        // Create the Album
        AlbumDTO albumDTO = albumMapper.toDto(album);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlbumMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(albumDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Album in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAlbum() throws Exception {
        // Initialize the database
        insertedAlbum = albumRepository.saveAndFlush(album);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the album
        restAlbumMockMvc
            .perform(delete(ENTITY_API_URL_ID, album.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return albumRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Album getPersistedAlbum(Album album) {
        return albumRepository.findById(album.getId()).orElseThrow();
    }

    protected void assertPersistedAlbumToMatchAllProperties(Album expectedAlbum) {
        assertAlbumAllPropertiesEquals(expectedAlbum, getPersistedAlbum(expectedAlbum));
    }

    protected void assertPersistedAlbumToMatchUpdatableProperties(Album expectedAlbum) {
        assertAlbumAllUpdatablePropertiesEquals(expectedAlbum, getPersistedAlbum(expectedAlbum));
    }
}
