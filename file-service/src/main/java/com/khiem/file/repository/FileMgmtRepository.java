package com.khiem.file.repository;

import com.khiem.file.entity.FileMgmt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileMgmtRepository extends MongoRepository<FileMgmt, String> {
}
