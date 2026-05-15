package com.musicplayer.web.rest;

import static com.musicplayer.domain.SongAsserts.*;
import static com.musicplayer.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicplayer.IntegrationTest;
import com.musicplayer.domain.Song;
import com.musicplayer.repository.SongRepository;
import com.musicplayer.service.SongService;
import com.musicplayer.service.dto.SongDTO;
import com.musicplayer.service.mapper.SongMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link SongResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SongResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final Integer DEFAULT_DURATION = 1;
    private static final Integer UPDATED_DURATION = 2;

    private static final String DEFAULT_FILE_URL = "AAAAAAAAAA";
    private static final String UPDATED_FILE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_COVER_IMAGE = "AAAAAAAAAA";
    private static final String UPDATED_COVER_IMAGE = "BBBBBBBBBB";

    private static final String DEFAULT_LYRICS = "AAAAAAAAAA";
    private static final String UPDATED_LYRICS = "BBBBBBBBBB";

    private static final LocalDateTime DEFAULT_RELEASE_DATE = LocalDateTime.ofEpochSecond(0L, 0, ZoneOffset.UTC);
    private static final LocalDateTime UPDATED_RELEASE_DATE = LocalDateTime.now(ZoneId.systemDefault());

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/songs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SongRepository songRepository;

    @Mock
    private SongRepository songRepositoryMock;

    @Autowired
    private SongMapper songMapper;

    @Mock
    private SongService songServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSongMockMvc;

    private Song song;

    private Song insertedSong;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Song createEntity() {
        return new Song()
            .title(DEFAULT_TITLE)
            .duration(DEFAULT_DURATION)
            .fileUrl(DEFAULT_FILE_URL)
            .coverImage(DEFAULT_COVER_IMAGE)
            .lyrics(DEFAULT_LYRICS)
            .releaseDate(DEFAULT_RELEASE_DATE)
            .createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Song createUpdatedEntity() {
        return new Song()
            .title(UPDATED_TITLE)
            .duration(UPDATED_DURATION)
            .fileUrl(UPDATED_FILE_URL)
            .coverImage(UPDATED_COVER_IMAGE)
            .lyrics(UPDATED_LYRICS)
            .releaseDate(UPDATED_RELEASE_DATE)
            .createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        song = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedSong != null) {
            songRepository.delete(insertedSong);
            insertedSong = null;
        }
    }

    @Test
    @Transactional
    void createSong() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);
        var returnedSongDTO = om.readValue(
            restSongMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SongDTO.class
        );

        // Validate the Song in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSong = songMapper.toEntity(returnedSongDTO);
        assertSongUpdatableFieldsEquals(returnedSong, getPersistedSong(returnedSong));

        insertedSong = returnedSong;
    }

    @Test
    @Transactional
    void createSongWithExistingId() throws Exception {
        // Create the Song with an existing ID
        song.setId(1L);
        SongDTO songDTO = songMapper.toDto(song);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSongMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        song.setTitle(null);

        // Create the Song, which fails.
        SongDTO songDTO = songMapper.toDto(song);

        restSongMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFileUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        song.setFileUrl(null);

        // Create the Song, which fails.
        SongDTO songDTO = songMapper.toDto(song);

        restSongMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSongs() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        // Get all the songList
        restSongMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(song.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].duration").value(hasItem(DEFAULT_DURATION)))
            .andExpect(jsonPath("$.[*].fileUrl").value(hasItem(DEFAULT_FILE_URL)))
            .andExpect(jsonPath("$.[*].coverImage").value(hasItem(DEFAULT_COVER_IMAGE)))
            .andExpect(jsonPath("$.[*].lyrics").value(hasItem(DEFAULT_LYRICS)))
            .andExpect(jsonPath("$.[*].releaseDate").value(hasItem(DEFAULT_RELEASE_DATE.toString())))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSongsWithEagerRelationshipsIsEnabled() throws Exception {
        when(songServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSongMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(songServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSongsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(songServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSongMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(songRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getSong() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        // Get the song
        restSongMockMvc
            .perform(get(ENTITY_API_URL_ID, song.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(song.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.duration").value(DEFAULT_DURATION))
            .andExpect(jsonPath("$.fileUrl").value(DEFAULT_FILE_URL))
            .andExpect(jsonPath("$.coverImage").value(DEFAULT_COVER_IMAGE))
            .andExpect(jsonPath("$.lyrics").value(DEFAULT_LYRICS))
            .andExpect(jsonPath("$.releaseDate").value(DEFAULT_RELEASE_DATE.toString()))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingSong() throws Exception {
        // Get the song
        restSongMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSong() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the song
        Song updatedSong = songRepository.findById(song.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSong are not directly saved in db
        em.detach(updatedSong);
        updatedSong
            .title(UPDATED_TITLE)
            .duration(UPDATED_DURATION)
            .fileUrl(UPDATED_FILE_URL)
            .coverImage(UPDATED_COVER_IMAGE)
            .lyrics(UPDATED_LYRICS)
            .releaseDate(UPDATED_RELEASE_DATE)
            .createdAt(UPDATED_CREATED_AT);
        SongDTO songDTO = songMapper.toDto(updatedSong);

        restSongMockMvc
            .perform(put(ENTITY_API_URL_ID, songDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isOk());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSongToMatchAllProperties(updatedSong);
    }

    @Test
    @Transactional
    void putNonExistingSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(put(ENTITY_API_URL_ID, songDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(songDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSongWithPatch() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the song using partial update
        Song partialUpdatedSong = new Song();
        partialUpdatedSong.setId(song.getId());

        partialUpdatedSong
            .title(UPDATED_TITLE)
            .duration(UPDATED_DURATION)
            .coverImage(UPDATED_COVER_IMAGE)
            .lyrics(UPDATED_LYRICS)
            .releaseDate(UPDATED_RELEASE_DATE);

        restSongMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSong.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSong))
            )
            .andExpect(status().isOk());

        // Validate the Song in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSongUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedSong, song), getPersistedSong(song));
    }

    @Test
    @Transactional
    void fullUpdateSongWithPatch() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the song using partial update
        Song partialUpdatedSong = new Song();
        partialUpdatedSong.setId(song.getId());

        partialUpdatedSong
            .title(UPDATED_TITLE)
            .duration(UPDATED_DURATION)
            .fileUrl(UPDATED_FILE_URL)
            .coverImage(UPDATED_COVER_IMAGE)
            .lyrics(UPDATED_LYRICS)
            .releaseDate(UPDATED_RELEASE_DATE)
            .createdAt(UPDATED_CREATED_AT);

        restSongMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSong.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSong))
            )
            .andExpect(status().isOk());

        // Validate the Song in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSongUpdatableFieldsEquals(partialUpdatedSong, getPersistedSong(partialUpdatedSong));
    }

    @Test
    @Transactional
    void patchNonExistingSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, songDTO.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(songDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(songDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSong() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        song.setId(longCount.incrementAndGet());

        // Create the Song
        SongDTO songDTO = songMapper.toDto(song);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSongMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(songDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Song in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSong() throws Exception {
        // Initialize the database
        insertedSong = songRepository.saveAndFlush(song);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the song
        restSongMockMvc
            .perform(delete(ENTITY_API_URL_ID, song.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return songRepository.count();
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

    protected Song getPersistedSong(Song song) {
        return songRepository.findById(song.getId()).orElseThrow();
    }

    protected void assertPersistedSongToMatchAllProperties(Song expectedSong) {
        assertSongAllPropertiesEquals(expectedSong, getPersistedSong(expectedSong));
    }

    protected void assertPersistedSongToMatchUpdatableProperties(Song expectedSong) {
        assertSongAllUpdatablePropertiesEquals(expectedSong, getPersistedSong(expectedSong));
    }
}
