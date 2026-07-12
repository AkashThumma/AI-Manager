package com.autodev.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GithubPushEvent {

    private String ref;
    
    private RepositoryDto repository;
    
    private List<CommitDto> commits;
    
    private PusherDto pusher;

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public RepositoryDto getRepository() {
        return repository;
    }

    public void setRepository(RepositoryDto repository) {
        this.repository = repository;
    }

    public List<CommitDto> getCommits() {
        return commits;
    }

    public void setCommits(List<CommitDto> commits) {
        this.commits = commits;
    }

    public PusherDto getPusher() {
        return pusher;
    }

    public void setPusher(PusherDto pusher) {
        this.pusher = pusher;
    }
}
