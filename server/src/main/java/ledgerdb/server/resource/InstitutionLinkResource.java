package ledgerdb.server.resource;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import ledgerdb.server.db.InstitutionLink;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

@Path("/institution_link")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class InstitutionLinkResource {

    private final SessionFactory sf;
    
    @Inject
    public InstitutionLinkResource(SessionFactory sf) {
        this.sf = sf;
    }
    
    @GET
    @Path("{institution}/{reference}")
    public InstitutionLink get(
            @PathParam("institution") String institution,
            @PathParam("reference") String reference) {
        InstitutionLink il;
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            il = (InstitutionLink)s.createCriteria(InstitutionLink.class)
                    .add(Restrictions.eq("institution", institution))
                    .add(Restrictions.eq("reference", reference))
                    .uniqueResult();
            tx.commit();
        }
        if (il == null)
            throw new NotFoundException();
        return il;
    }
}
