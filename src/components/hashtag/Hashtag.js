import {useContext, useEffect,useState,useRef} from 'react';
import UserContext from '../UserContext';
import axios from 'axios';
import {useParams,useHistory} from 'react-router-dom';
import TrendingList from './TrendingList';

/*import de style components*/
import {TimelineContainer,Container,TimelineContent,} from '../timelineStyledComponents'

/*import dos Posts*/
import Posts from '../Posts'

/*InfiniteScroller*/
import InfiniteScroll from 'react-infinite-scroller';
    

export default function OtherUsersPosts({goToLink, openMap}){
    const {hashtag} = useParams();
    const history=useHistory();
    const {user} = useContext(UserContext);
    const [hashtagPosts,setHashtagPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [olderLikes, setOlderLikes] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const inputRef = useRef([]);


    /*Logics of infinite Scroller*/ 
  
  const[hasMore,setHasMore] = useState(false)

    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    }

    useEffect(()=>{
        updateHashtagPosts()
        
    },[hashtag])

    function updateHashtagPosts(newVal){ 
       const getPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/hashtags/${newVal || hashtag}/posts`,config)

        getPosts.then((response)=>{
            const newArray = response.data.posts
            
           
          
            setHashtagPosts(newArray)
            setServerLoading(false) 
            let sharpedHeart = []
            newArray.forEach( post => {
                post.likes.forEach(n =>{
                if(n.userId === user.user.id){
                    sharpedHeart.push({id: post.id, likes: post.likes.length, names: post.likes.map(n => n["user.username"])})
                }})
            })   
            setLikedPosts(sharpedHeart);
            setOlderLikes(sharpedHeart);
            setHasMore(true)

        })

        getPosts.catch((responseError)=>{
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })
    }

    function sendToHashtag(val){
        const newVal = val.replace('#',"")
        setServerLoading(true) 
        updateHashtagPosts(newVal)
        history.push(`/hashtag/${newVal}`)
    }

    function goToUserPosts(id){
        if(id!==user.user.id){
        history.push(`/user/${id}`)
        }
        else{
            history.push(`/my-posts`)
        }
    }

    function scrollPage(lastPost){
        

        if(hashtagPosts[lastPost]===undefined){
            return
        }

     const getNewPosts =  axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/hashtags/${hashtag}/posts?offset=${hashtagPosts.length}`,config)
        getNewPosts.then((response)=>{
            
            
            if(response.data.posts.length<10){
                setHasMore(false)
            }
            
            const scrollPosts = response.data.posts
            

            setHashtagPosts([...hashtagPosts,...scrollPosts])
           
        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar')
            

        })

       
    }

    function scrollLoader(){
        if(hasMore){
            return(

                <div className="loader" key={0}>Loading More Posts...</div>
            )
        }else{
            return(
                ''
            )
        }
    }
   
    return( 
      
    <Container>
        
        <TimelineContainer>
            <h1>{ !serverLoading 
            ? `#${hashtag}'s posts`  
            :'carregando'}</h1> 
                
                <TimelineContent>

                    <InfiniteScroll
                        pageStart={0}
                        loadMore={()=>scrollPage(hashtagPosts.length-1)}
                        hasMore={hasMore}
                        loader={ <div className="loader" key={0}>Loading More Posts...</div>}
                        threshold={1}
                        className='Scroller'
                        
                    > 
                        <Posts noPostsMessage={'Não há posts dessa hashtag no momento'}
                                    serverLoading={serverLoading}
                                    allPosts={hashtagPosts}
                                    goToUserPosts={goToUserPosts}
                                    olderLikes={olderLikes}
                                    likedPosts={likedPosts}
                                    user={user}
                                    like={like}
                                    inputRef={inputRef}
                                    goToLink={goToLink}
                                    openMap={openMap}
                                    sendToHashtag={sendToHashtag}
                                    updateHashtagPosts={updateHashtagPosts}
                        />
                    </InfiniteScroll>

                    <TrendingList send={sendToHashtag}/>

                </TimelineContent>
        </TimelineContainer>

                  
                            
                           
                          
                            
                                        

    </Container>
    )
    function like (id){
        const config = {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        }
        if(likedPosts.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/dislike`, {}, config)
            request.then(success => {
                setLikedPosts(likedPosts.filter( (n,i) => n.id !== id))
                if(olderLikes.map(n => n.id).includes(id))
                setOlderLikes([... olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else{
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/like`, {}, config)
            request.then(success => {
                setLikedPosts([...likedPosts, {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                if(olderLikes.map(n => n.id).includes(id)){
                    setOlderLikes([...olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                }
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
    }
}
