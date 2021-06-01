import styled from 'styled-components';
import {useContext, useEffect,useState,useRef} from 'react';
import NewPost from './NewPost';
import UserContext from '../UserContext';
import axios from 'axios';
import ReactHashtag from "react-hashtag";
import {useHistory} from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Loader from "react-loader-spinner";
import ActionsPost from './ActionsPost';
import TrendingList from './TrendingList';
import { HeartOutline, HeartSharp } from 'react-ionicons';
import InputNewText from './InputNewText';
import LinkPreview from './LinkPreview'

/*import dos Posts*/
import Posts from '../Posts'

/*InfiniteScroller*/
import InfiniteScroll from 'react-infinite-scroller';

/*import de style components*/
import {PostInfo,LinkDescription,Links,Hashtag,Title,TimelineContainer,
Container,TimelinePosts,TimelineContent,LinkDetails,UserName,NoPostsYet,PostContent} from '../timelineStyledComponents'

/* Import UseInterval custom hook*/
import UseInterval from '../UseInterval'

export default function Timeline({goToLink}){
    const history = useHistory()
    const [likedPosts, setLikedPosts] = useState([]);
    const { user ,setUser} = useContext(UserContext);
    const [allPosts,setAllPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [olderLikes, setOlderLikes] = useState([]); 

    const inputRef = useRef([])

    const [timelineRef,setTimelineRef] = useState(false);
    /*Logics of infinite Scroller*/ 
    const [maxNumberOfPosts,setMaxNumberOfPosts] = useState(null)
    const[hasMore,setHasMore] = useState(true)


    
    useEffect(()=>{
            update()        
    },[]);

    UseInterval(() => {
    
    const getNewPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts',config)

    getNewPosts.then((response)=>{
     
     const holder = allPosts[0]

       let numberHolder='x'

       response.data.posts.forEach((post,index)=>{
            if(post.id===holder.id){
                numberHolder=index
            }
       })
       const newPosts = response.data.posts.splice(0,numberHolder)
        setAllPosts([...newPosts,...allPosts])

    })
    

       }, 15000); 

    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    }

    function partialUpdate(limit){
        
        setTimeout(()=>{
            const getPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts',config)
        
        getPosts.then((response)=>{
            const newArray = (response.data.posts.map((p)=>({...p, toEdit: false, geolocation: {
                "latitude": '',
                "longitude": ''
            }
        })));

            const partial = newArray.slice(0,limit)
            setAllPosts(partial)
            let sharpedHeart = []
            newArray.forEach( post => {
                post.likes.forEach(n =>{
                if(n.userId === user.user.id){
                    sharpedHeart.push({id: post.id, likes: post.likes.length, names: post.likes.map(n => n["user.username"])})
                }})
            })
            setLikedPosts(sharpedHeart);
            setOlderLikes(sharpedHeart);
        })

        },1000)

       maxNumberOfPosts===allPosts.length ? setHasMore(false) : setHasMore(true)
    }

    function update () {
        
        const getPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts',config)
        setServerLoading(true)
        
        getPosts.then((response)=>{
            const newArray = (response.data.posts.map((p)=>({...p, toEdit: false})));
            setMaxNumberOfPosts(response.data.posts.length)
            
            const partial = newArray.slice(0,2)
            
            setAllPosts(partial)
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
        })

        getPosts.catch((responseError)=>{           
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })
    }
        
   

    function sendToHashtag(val){
       
        const newVal = val.replace('#',"")
        
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

    function tryingToEdit(id) {
        let postsToEdit = allPosts.map((p) => {
            if(p.id === id){
                p.toEdit = !p.toEdit;
            }
            return {...p};
        })   
        setAllPosts([...postsToEdit]);

        setTimeout(()=>{

            inputRef.current[id].focus()
           },100) 
    }

   
    return( 
        
        <Container>
            
            <TimelineContainer>
            <Title>timeline</Title> 

                    <NewPost update={update} />
        
                    <TimelineContent>
                        
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={() => partialUpdate( allPosts.length + 2 )}
                            hasMore={hasMore}
                            loader={<div className="x" key={0}>Loading ...</div>}
                            className='x'
                        >
                            
                            <Posts noPostsMessage={'Nenhum post encontrado'}
                                update={update}
                                serverLoading={serverLoading}
                                allPosts={allPosts}
                                goToUserPosts={goToUserPosts}
                                olderLikes={olderLikes}
                                likedPosts={likedPosts}
                                user={user}
                                like={like}
                                tryingToEdit={tryingToEdit}
                                config={config}
                                inputRef={inputRef}
                                goToLink={goToLink}
                                
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

