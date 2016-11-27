package ledgerdb.server.db;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Entity
public class PostingHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "posting_header_id")
    private Integer id;
    
    @Temporal(TemporalType.DATE)
    @NotNull
    @JsonProperty("posting_date")
    @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd")
    private Date postingDate;
    
    @JsonProperty("accountable_user_id")
    private int accountableUserId = 1; //TODO
    
    @Pattern(regexp = "^\\p{Print}{0,128}$")
    @Size(max = 128)
    private String description;
    
    @OneToMany(mappedBy = "postingHeader", cascade = CascadeType.PERSIST)
    @JsonProperty("details")
    private final List<PostingDetail> details = new ArrayList<>();
    
    public Integer getId() {
        return id;
    }
    
    public Date getPostingDate() {
        return postingDate;
    }
    
    public void setPostingDate(Date postingDate) {
        this.postingDate = postingDate;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public void addPostingDetail(PostingDetail postingDetail) {
        details.add(postingDetail);
        postingDetail.setPostingHeader(this);
    }
    
    @JsonIgnore
    public List<PostingDetail> getPostingDetails() {
        return Collections.unmodifiableList(details);
    }
}
